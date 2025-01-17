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

const Home = () => {
  const [users, setUsers] = useState([]);
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

  const navigate = useNavigate();

  // useEffect(() => {
  //   fetch("/api/users") // This will be proxied to 'http://localhost:5000/users'
  //     .then((response) => response.json())
  //     .then((data) => setUsers(data));
  //   console.log("hello", user);
  // }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
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
      const response = await fetch("/users", {
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

  // Mock daily data with individual user data
  const dailyData = [
    { date: "Nov 15", Alice: 5, Bob: 7, Kyle: 4 },
    { date: "Nov 16", Alice: 8, Bob: 6, Kyle: 5 },
    { date: "Nov 17", Alice: 7, Bob: 5, Kyle: 6 },
    { date: "Nov 18", Alice: 6, Bob: 8, Kyle: 7 },
    { date: "Nov 19", Alice: 5, Bob: 9, Kyle: 8 },
    { date: "Nov 20", Alice: 10, Bob: 7, Kyle: 6 },
    { date: "Nov 21", Alice: 9, Bob: 6, Kyle: 5 },
  ];

  console.log(dailyData); // Debugging: Ensure dailyData is populated correctly

  return (
    <div>
      <h1>Job Application Leaderboard</h1>
      <div>
        <button onClick={toggleForm} className="open-popup-btn">
          Join Board
        </button>
      </div>
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
                stroke={`hsl(${index * 120}, 70%, 50%)`} // Generate unique colors
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
