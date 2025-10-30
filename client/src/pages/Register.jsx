import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "../api/firebaseConfig";
import axios from "../api/axiosInstance"; // your global axios
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { comfortQuestions } from "../data/questionnaire"; // import your questions

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    ethnicity: "",
    email: "",
    password: "",
    health_issues: "none",
  });

  const [questionnaire, setQuestionnaire] = useState({});

  const navigate = useNavigate();

  const handleNext = () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    setStep(2);
  };

  const handleLikertChange = (id, value, questionText) => {
    setQuestionnaire((prev) => ({
      ...prev,
      [id]: { question: questionText, answer: value },
    }));
  };

  const handleTextChange = (id, value, questionText) => {
    setQuestionnaire((prev) => ({
      ...prev,
      [id]: { question: questionText, answer: value },
    }));
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Send user data to backend
      const userPayload = {
        ...formData,
        questionnaire: Object.values(questionnaire),
      };

      await axios.post("/users/register", userPayload);

      toast.success("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>

      {step === 1 && (
        <div className="flex flex-col gap-3 w-full max-w-md">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            className="border p-2 rounded"
            placeholder="Ethnicity"
            value={formData.ethnicity}
            onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={formData.health_issues}
            onChange={(e) => setFormData({ ...formData, health_issues: e.target.value })}
          >
            <option value="none">None</option>
            <option value="asthma">Asthma</option>
            <option value="copd">COPD</option>
            <option value="sinusitis">Sinusitis</option>
            <option value="allergy">Allergy</option>
          </select>

          <input
            className="border p-2 rounded"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            onClick={handleNext}
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 w-full max-w-xl">
          {comfortQuestions.map((q) => (
            <div key={q.id} className="border p-4 rounded shadow-sm">
              <p className="font-medium mb-2">{q.question}</p>

              {q.type === "likert" ? (
                <div className="flex justify-between px-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name={`q${q.id}`}
                        value={num}
                        onChange={() =>
                          handleLikertChange(q.id, num, q.question)
                        }
                      />
                      <span className="text-sm">{num}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Your answer"
                  onChange={(e) =>
                    handleTextChange(q.id, e.target.value, q.question)
                  }
                />
              )}
            </div>
          ))}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
