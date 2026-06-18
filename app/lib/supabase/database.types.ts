export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          session_id: string;
          project_name: string;
          created_at: string;
          photo1_url: string;
          photo2_url: string;
          photo3_url: string;
          strip_url: string;
          gif_url: string;
        };
        Insert: {
          session_id: string;
          project_name: string;
          created_at: string;
          photo1_url: string;
          photo2_url: string;
          photo3_url: string;
          strip_url: string;
          gif_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
      };
    };
  };
};
