import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "%c[THENOS::404]",
      "color:#ff0033;font-weight:bold;",
      "Unauthorized route access attempt:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-green-400 font-mono px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-6xl font-bold tracking-widest text-red-500 animate-pulse">
          404
        </h1>

        <p className="text-xl">
          &gt; SYSTEM TRACE: <span className="text-red-400">ROUTE_NOT_FOUND</span>
        </p>

        <p className="text-sm text-green-500/80">
          The endpoint{" "}
          <span className="text-yellow-400">{location.pathname}</span> does not
          exist on this node.
        </p>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-left text-sm">
          <p>&gt; initiating fallback protocol...</p>
          <p>&gt; rerouting user to safe location</p>
          <p className="text-green-300">&gt; status: STABLE</p>
        </div>

        <Link
          to="/"
          className="inline-block mt-4 px-6 py-2 border border-green-400 text-green-300 hover:bg-green-400 hover:text-black transition-all duration-300 rounded"
        >
          RETURN TO BASE
        </Link>

        <p className="text-xs text-green-700 pt-6">
          Thenos Security Layer • Access Logged
        </p>
      </div>
    </div>
  );
};

export default NotFound;
