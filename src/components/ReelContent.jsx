import React, { useEffect, useState, useRef, useCallback } from "react";
import ReelsCard from "./ReelsCard";
import { users } from "./User";

const queries = ["luxury cars", "money", "computer", "technology"];
const batchSize = 10;
const maxReels = 300;

const ReelContent = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const observer = useRef();

  const lastReelRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  const fetchVideos = async () => {
    if (reels.length >= maxReels) return;
    setLoading(true);

    const currentQuery = queries[page % queries.length];
    try {
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(currentQuery)}&per_page=${batchSize}&page=${Math.floor(page / queries.length) + 1}`,
        {
          headers: {
            Authorization: "8XnOmd2wlkzhGAIGA5g5rhsopEhzvMdh5TeQLG9TByEV6C6cTr3jTA0y", // Replace this
          },
        }
      );
      const data = await res.json();

      const newReels = data.videos
        .filter((video) => video.width < video.height)
        .map((video, i) => ({
          id: `${video.id}-${page}-${i}`,
          videoUrl:
            video.video_files.find((f) => f.quality === "hd" && f.width < f.height)?.link ||
            video.video_files[0].link,
          user: users[(reels.length + i) % users.length],
        }));

      setReels((prev) => [...prev, ...newReels]);
    } catch (err) {
      console.error("Failed to fetch reels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  return (
    <div className="reels-scroll-wrapper">
      {reels.map((reel, index) => {
        const isLast = index === reels.length - 1;
        return (
          <div
            ref={isLast ? lastReelRef : null}
            key={reel.id}
            className="reel-snap"
          >
            <ReelsCard videoUrl={reel.videoUrl} user={reel.user} />
          </div>
        );
      })}
      {loading && <p className="loading-text">Loading more reels...</p>}
    </div>
  );
};

export default ReelContent;




// import React, { useEffect, useState } from "react";
// import ReelsCard from "./reelsCard";
// import { users } from "../User"; // Fetch user data for names & avatars

// const ReelContent = () => {
//   const [reels, setReels] = useState([]);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const res = await fetch("https://api.pexels.com/videos/popular?per_page=10", {
//           headers: {
//             Authorization: "8XnOmd2wlkzhGAIGA5g5rhsopEhzvMdh5TeQLG9TByEV6C6cTr3jTA0y", // Replace with your free API key
//           },
//         });
//         const data = await res.json();
//         const videos = data.videos
//           .filter(video => video.width < video.height) // Filter vertical
//           .map((video, i) => ({
//             id: video.id,
//             videoUrl: video.video_files.find(f => f.quality === "sd" && f.width < f.height)?.link || video.video_files[0].link,
//             user: users[i % users.length], // Cycle through dummy users
//           }));
//         setReels(videos);
//       } catch (err) {
//         console.error("Error fetching reels:", err);
//       }
//     };

//     fetchVideos();
//   }, []);

//   return (
//     <div>
//       {reels.map((reel, index) => (
//         <ReelsCard key={reel.id} video={reel.videoUrl} user={reel.user} />
//       ))}
//     </div>
//   );
// };

// export default ReelContent;
