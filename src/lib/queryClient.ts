import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Süreyi sıfırlıyoruz ki sayfalar arası geçişlerde anında taze veri çekilsin
      staleTime: 0,
      // Kullanıcı başka bir sekmeden geldiğinde veya bildirimden döndüğünde verileri otomatik yeniler
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});
