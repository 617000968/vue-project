import axios from 'axios';

// 后端 API 基础 URL
const API_URL = "http://localhost:8080/api/auth"; // 根据实际后端地址调整

// 登录请求
export const login = (username, password) => {
  return axios.post(`${API_URL}/login`, null, {
    params: { username, password },
  });
};

// 注册请求
export const register = (user) => {
  return axios.post(`${API_URL}/register`, user);
};

// 更新用户请求
export const updateUser = (id, user, token) => {
  return axios.put(`${API_URL}/${id}`, user, {
    headers: {
      Authorization: `Bearer ${token}`, // 将 token 添加到请求头
    },
  });
};

// 删除用户请求
export const deleteUser = (id, token) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
