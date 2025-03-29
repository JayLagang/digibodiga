const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CLIENT_URL.split(",");
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true,
};

export default corsConfig;
