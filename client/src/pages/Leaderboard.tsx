import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  totalXP: number;
  level: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?limit=10');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="font-game text-lg text-gray-400">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-green-500 to-emerald-600";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-emerald-600 to-teal-700";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-game text-2xl sm:text-3xl text-center mb-12 text-green-400 glow-text">
          Leaderboard
        </h1>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-4 border-green-500 glow">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Trophy className="w-8 h-8 text-green-400" />
            <h2 className="font-game text-xl text-white">Top Learners</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-orbitron text-gray-400">Loading rankings...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="font-orbitron text-gray-400">No players yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={entry.username}
                    className={`bg-gradient-to-r ${getRankColor(rank)} p-[2px] rounded-xl transition-all hover:scale-102`}
                  >
                    <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-slate-700 rounded-lg">
                        {getRankIcon(rank)}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-game text-lg text-white mb-1">
                          {entry.username}
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-orbitron text-gray-400">
                            Level {entry.level}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="font-orbitron text-green-400">
                            {entry.totalXP.toLocaleString()} XP
                          </span>
                        </div>
                      </div>

                      {rank <= 3 && (
                        <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getRankColor(rank)}`}>
                          <span className="font-game text-xs text-white">
                            {rank === 1 ? "Champion" : rank === 2 ? "Expert" : "Master"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="font-orbitron text-sm text-gray-400">
            Complete more levels and earn XP to climb the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
}
