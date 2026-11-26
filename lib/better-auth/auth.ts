
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

const initializeAuth = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error(
            "MONGODB_URI must be set in .env.local"
        );
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
    } catch (error) {
        await client.close();
        throw error;
    }

    const db = process.env.MONGODB_DB
        ? client.db(process.env.MONGODB_DB)
        : client.db();

    return betterAuth({
        database: mongodbAdapter(db),

        secret: process.env.BETTER_AUTH_SECRET,

        baseURL: process.env.BETTER_AUTH_URL,

        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },

        plugins: [nextCookies()],
    });
};

let authPromise: ReturnType<typeof initializeAuth> | null =
    null;

export const getAuth = () => {
    if (!authPromise) {
        authPromise = initializeAuth().catch((error) => {
            authPromise = null;
            throw error;
        });
    }

    return authPromise;
};

export const auth = await getAuth();
