import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define your server URL
const URL = 'http://localhost:3000'; // Example URL

interface RoomProps {
    name: string;
    localAudioTrack: MediaStreamTrack | null;
    localVideoTrack: MediaStreamTrack | null;
    // roomId is removed
}

const Room: React.FC<RoomProps> = ({ name, localAudioTrack, localVideoTrack }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null); // Optional: for more control
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null); // Optional: for more control

    useEffect(() => {
        if (localVideoRef.current && (localVideoTrack || localAudioTrack)) {
            const localStream = new MediaStream();
            if (localVideoTrack) localStream.addTrack(localVideoTrack);
            if (localAudioTrack) localStream.addTrack(localAudioTrack);
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(e => console.error("Error playing local video:", e));
            localVideoRef.current.muted = true;
        }
    }, [localVideoTrack, localAudioTrack]);

    useEffect(() => {
        const newSocket = io(URL);
        setSocket(newSocket);

        const stream = new MediaStream();
        setRemoteMediaStream(stream);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.play().catch(e => console.warn("Remote video play initially failed (no tracks yet):", e));
        }

        const handleRemoteTrack = (event: RTCTrackEvent) => {
            console.log(`Remote track received: ${event.track.kind}`);
            if (remoteMediaStream) {
                remoteMediaStream.addTrack(event.track);
                if (event.track.kind === 'video') setRemoteVideoTrack(event.track);
                if (event.track.kind === 'audio') setRemoteAudioTrack(event.track);
                if (remoteVideoRef.current && remoteVideoRef.current.paused) {
                    remoteVideoRef.current.play().catch(e => console.error("Error playing remote video from ontrack:", e));
                }
            }
        };

        newSocket.on('connect', () => {
            console.log('Connected to signaling server with id:', newSocket.id);
            // Let the server know this client is ready to be paired
            newSocket.emit('client-ready', { name });
        });

        newSocket.on('lobby', () => {
            console.log("Server placed client in lobby.");
            setLobby(true);
        });

        // Server tells this client to initiate the offer
        newSocket.on('send-offer', async () => { // No longer receives {roomId}
            console.log("Socket event: send-offer received. This client will send an offer.");
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    newSocket.emit("add-ice-candidate", { // No roomId
                        candidate: event.candidate,
                        type: "sender"
                    });
                }
            };

            pc.onnegotiationneeded = async () => {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    newSocket.emit("offer", { sdp: offer }); // No roomId
                } catch (e) {
                    console.error("Error during offer creation/sending:", e);
                }
            };
            pc.ontrack = handleRemoteTrack;

            if (localVideoTrack) pc.addTrack(localVideoTrack);
            if (localAudioTrack) pc.addTrack(localAudioTrack);
        });

        // Server sends an offer from another peer to this client
        newSocket.on("offer", async ({ sdp: remoteSdp }: { sdp: RTCSessionDescriptionInit }) => { // No roomId
            console.log("Socket event: offer received. This client will create an answer.");
            setLobby(false);
            const pc = new RTCPeerConnection();
            setReceivingPc(pc);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    newSocket.emit("add-ice-candidate", { // No roomId
                        candidate: event.candidate,
                        type: "receiver"
                    });
                }
            };
            pc.ontrack = handleRemoteTrack;

            try {
                await pc.setRemoteDescription(remoteSdp);
                if (localVideoTrack) pc.addTrack(localVideoTrack);
                if (localAudioTrack) pc.addTrack(localAudioTrack);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                newSocket.emit("answer", { sdp: answer }); // No roomId
            } catch (e) {
                console.error("Error during answer creation/setting descriptions:", e);
            }
        });

        // Server sends an answer from another peer
        newSocket.on("answer", async ({ sdp: remoteSdp }: { sdp: RTCSessionDescriptionInit }) => { // No roomId
            console.log("Socket event: answer received.");
            setLobby(false);
            setSendingPc(prevPc => {
                if (prevPc) {
                    prevPc.setRemoteDescription(remoteSdp)
                        .catch(e => console.error("Error setting remote description (answer):", e));
                }
                return prevPc;
            });
        });

        // Server sends an ICE candidate from another peer
        newSocket.on("add-ice-candidate", ({ candidate, type }: { candidate: RTCIceCandidateInit, type: string }) => { // No roomId
            console.log(`Socket event: add-ice-candidate received. Type: ${type}`);
            // The 'type' helps the client decide if it's for its 'sendingPc' or 'receivingPc'
            const pc = type === "sender" ? receivingPc : sendingPc; // If candidate came from sender, add to receiver PC. If from receiver, add to sender PC.
            if (pc) {
                pc.addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(e => console.error("Error adding received ICE candidate:", e));
            }
        });

        newSocket.on('peer-disconnected', () => {
            console.log("Peer disconnected. Resetting state.");
            setLobby(true);
            // Close existing peer connections and reset
            sendingPc?.close();
            receivingPc?.close();
            setSendingPc(null);
            setReceivingPc(null);
            // Clear remote tracks
            const newRemoteStream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = newRemoteStream;
            }
            setRemoteMediaStream(newRemoteStream);
            setRemoteVideoTrack(null);
            setRemoteAudioTrack(null);
            // Optionally, inform the user and prompt to find a new peer
        });
        
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            sendingPc?.close();
            receivingPc?.close();
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        };

    
    }, [name, localAudioTrack, localVideoTrack]); // Dependencies

    return (
        <div>
            <h2>Hi {name}</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <h3>Your Video</h3>
                    <video ref={localVideoRef} width={300} height={225} autoPlay playsInline muted />
                </div>
                <div>
                    <h3>Remote Video</h3>
                    <video ref={remoteVideoRef} width={300} height={225} autoPlay playsInline />
                </div>
            </div>
            {lobby && <p>Waiting to connect to someone...</p>}
        </div>
    );
};

export default Room;