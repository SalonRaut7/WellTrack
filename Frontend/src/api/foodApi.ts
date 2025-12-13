import api from "./axios";

export interface FoodEntryDTO {
  id?: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  mealType: string;
}

export interface FoodTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface TodayFoodResponse {
  entries: FoodEntryDTO[];
  totals: FoodTotals;
}

export const getTodayFood = async (): Promise<TodayFoodResponse> => {
  const res = await api.get("/api/foodlog/today", {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  return res.data;
};

export const addFood = async (food: FoodEntryDTO) => {
  const res = await api.post("/api/foodlog", food, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  return res.data;
};

export const updateFood = async (id: number, food: FoodEntryDTO) => {
  const res = await api.put(`/api/foodlog/${id}`, food, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  return res.data;
};

export const deleteFood = async (id: number) => {
  await api.delete(`/api/foodlog/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
};

export const searchUsdaFood = async (query: string) => {
  const res = await api.get(`/api/foodlog/search?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  return res.data;
};
