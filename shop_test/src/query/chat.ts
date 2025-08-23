import axiosClient from "@/lib/axiosClient";
import type { Message } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const thid = localStorage.getItem("threadId");

export const useGetMessages = (en: boolean) => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const data = await axiosClient.get<Array<Message>>(
        `/get-messages?thread_id=${thid}`,
      );
      if (!data) {
        throw new Error("Failed to fetch messages");
      }
      return data;
    },
    enabled: !!thid && en,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    retryOnMount: false,
    staleTime: Infinity,
  });
};

export const useGetThreadId = () => {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["threadId"],
    queryFn: async () => {
      qc.setQueriesData({ queryKey: ["messages"] }, []);
      const data = await axiosClient.get<{ thread_id: string }>("/thread");
      if (!data) {
        throw new Error("Failed to fetch thread ID");
      }
      localStorage.setItem("threadId", data.thread_id);

      return data.thread_id;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: !thid,
  });
};

export const useDeleteThread = () => {
  return useMutation({
    mutationFn: async () => {
      const data = await axiosClient.delete<{ message: string }>("/thread?thread_id=" + thid);
      if (!data) {
        throw new Error("Failed to delete thread");
      }
      localStorage.removeItem("threadId");
      return data.message;
    },
  });
};
