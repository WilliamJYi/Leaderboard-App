import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

import User from "../user/User";
import "./Home.css";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    date_joined: new Date().toISOString().slice(0, 10),
    apps_today: 0,
    daily_goal: 15,
    apps_this_week: 0,
    weekly_goal: 110,
    total_apps: 0,
  }); // have a template for this
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  // const [weeklyUserApplications, setWeeklyUserApplications] =

  // useEffect(() => {
  //   fetch("/api/users") // This will be proxied to 'http://localhost:5000/users'
  //     .then((response) => response.json())
  //     .then((data) => setUsers(data));
  //   console.log("hello", user);
  // }, []);

  useEffect(() => {
    getAccess();
  }, []);

  const getAccess = async () => {
    try {
      const response = await fetch("/api/auth/free-endpoint");
      if (!response.ok) {
        throw new Error("Cannot access page");
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      generateDailyData();
    }
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Clean up code here
  const generateDailyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      subDays(new Date(), i)
    ).reverse();

    const formattedDailyData = last7Days.map((date) => {
      const formattedDate = format(date, "MMM dd");
      const dailyApplications = { date: formattedDate };

      users.forEach((user) => {
        const count = user.applications.filter(
          (app) =>
            new Date(app.date_added).toLocaleDateString() ===
            date.toLocaleDateString()
        ).length;
        dailyApplications[user.name] = count;
      });

      return dailyApplications;
    });

    setDailyData(formattedDailyData);
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add new user");
      }
      console.log("Successfully added new user");
      fetchUsers();
      toggleForm();
    } catch (error) {
      console.error("Error adding user", error);
    }
  };

  const displayUsers = () => {
    if (users.length > 0) {
      return users.map((user, index) => {
        return <User key={index} user={user} />;
      });
    }
  };

  // const updateWeeklyRankings = () => {

  // }

  // Mock daily data with individual user data
  // const dailyData = [
  //   { date: "Nov 15", Alice: 5, Bob: 7, Kyle: 4 },
  //   { date: "Nov 16", Alice: 8, Bob: 6, Kyle: 5 },
  //   { date: "Nov 17", Alice: 7, Bob: 5, Kyle: 6 },
  //   { date: "Nov 18", Alice: 6, Bob: 8, Kyle: 7 },
  //   { date: "Nov 19", Alice: 5, Bob: 9, Kyle: 8 },
  //   { date: "Nov 20", Alice: 10, Bob: 7, Kyle: 6 },
  //   { date: "Nov 21", Alice: 9, Bob: 6, Kyle: 5 },
  // ];

  console.log(dailyData); // Debugging: Ensure dailyData is populated correctly

  if (users.length === 0) {
    return <p>Loading...</p>; // Show loading message while data is fetched
  }

  return (
    <div className="main-container">
      <h3 className="text-center text-danger">{message}</h3>
      {isFormOpen && (
        <div className="popup-overlay">
          <div className="popup-form">
            <button onClick={toggleForm} className="close-btn">
              &times;
            </button>
            <h2>Create User</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="daily_goal">Daily Goal:</label>
                <input
                  type="number"
                  id="daily_goal"
                  name="daily_goal"
                  value={formData.daily_goal || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="weekly_goal">Weekly Goal:</label>
                <input
                  type="number"
                  id="weekly_goal"
                  name="weekly_goal"
                  value={formData.weekly_goal || ""}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      <div>Application Trend</div>
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer>
          <LineChart data={dailyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {/* Create a Line for each user */}
            {users.map((user, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={user.name} // Matches user name in dailyData keys
                stroke={`hsl(${index * 60}, 70%, 50%)`} // Generate unique colors
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="users-container">{displayUsers()}</div>
    </div>
  );
};

export default Home;
