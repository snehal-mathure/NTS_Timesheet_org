// import axios from "axios";

// const API_BASE = "http://localhost:5000";

// export const getWorkforceSkillDistribution = async (experience = "all") => {
//   const response = await axios.get(
//     `${API_BASE}/admin/workforce_skill_distribution`,
//     {
//       params: { experience },
//     }
//   );

//   return response.data; // { experience, data }
// };

// export const exportWorkforceSkillDistribution = () => {
//   return axios.get(
//     `${API_BASE}/admin/workforce_skill_distribution/export`,
//     {
//       responseType: "blob",
//     }
//   );
// };


import axios from "axios";

const API_BASE = "http://localhost:5000";

export const getWorkforceSkillDistribution = async (experience = "all") => {
  const response = await axios.get(
    `${API_BASE}/admin/workforce_skill_distribution`,
    {
      params: { experience },
    }
  );

  // backend returns { experience, data }
  return response.data;
};

export const exportWorkforceSkillDistribution = async (experience = "all") => {
  const response = await axios.get(
    `${API_BASE}/admin/workforce_skill_distribution/export`,
    {
      params: { experience },
      responseType: "blob",
    }
  );

  // 🔽 force download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    "workforce_skill_distribution.csv"
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
};
