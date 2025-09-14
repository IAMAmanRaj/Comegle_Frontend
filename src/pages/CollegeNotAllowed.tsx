import { useAuthStore } from "../store/useAuthStore";

const CollegeNotAllowed = () => {

  const {user} = useAuthStore();


  return (
    <div className="h-screen w-full bg-black flex items-center justify-center flex-col text-white p-4">
      <h1 className="text-4xl font-bold">College Not Allowed</h1>
      <p className="mt-4">
        We're sorry, but your college is not allowed on this platform. You can
        fill the details below to request access:
      </p>
      <form className="mt-6 flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Your Name"
          defaultValue={user?.fullName}
          className="p-2 rounded bg-white/50 text-black"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          defaultValue={user?.email}
          className="p-2 rounded bg-white/50 text-black"
          required
        />
        <textarea
          placeholder="Your college name here ( write it like this Indian Institute of Technology Delhi (iitd) )"
          className="p-2 rounded bg-white/50 text-black"
          required
        />
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Request Access
        </button>
      </form>
    </div>
  );
};

export default CollegeNotAllowed;
