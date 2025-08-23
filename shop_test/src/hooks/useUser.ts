import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

const LS = typeof localStorage !== "undefined" ? localStorage : null;

const useUser = () => {
  const router = useRouter();
  const utils = api.useUtils();

  const localToken = LS?.getItem("jwt");
  const u = api.auth.me.useQuery(
    {
      token: localToken ?? "",
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      refetchOnReconnect: false,
      throwOnError: false,
    },
  );

  const logOut = async () => {
    LS?.removeItem("jwt");
    utils.auth.me.setQueriesData(
      {
        token: "",
      },
      {},
      () => null,
    );
    // Optionally, you can redirect the user after logging out
    router.replace("/login");
  };
  const isLoggedIn = !!u.data?.email;
  return { ...u, logOut, isLoggedIn };
};

export default useUser;
