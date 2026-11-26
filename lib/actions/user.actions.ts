
import { connectToDatabase } from "@/database/mongoose";

export type NewsEmailUser = {
    id: string;
    email: string;
    name: string;
    country?: string;
};

type BetterAuthUserRecord = {
    id?: string;
    email?: string;
    name?: string;
    country?: string;
};

export const getAllUsersForNewsEmail = async (): Promise<
    NewsEmailUser[]
> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error(
                "Mongoose connection not connected"
            );
        }

        const users = await db
            .collection<BetterAuthUserRecord>("user")
            .find(
                {
                    email: {
                        $exists: true,
                    },
                },
                {
                    projection: {
                        _id: 1,
                        id: 1,
                        email: 1,
                        name: 1,
                        country: 1,
                    },
                }
            )
            .toArray();

        const validUsers: NewsEmailUser[] = [];

        for (const user of users) {
            if (
                typeof user.email !== "string" ||
                !user.email.trim() ||
                typeof user.name !== "string" ||
                !user.name.trim()
            ) {
                continue;
            }

            const id =
                typeof user.id === "string" &&
                user.id.trim()
                    ? user.id.trim()
                    : user._id.toString();

            if (!id) {
                continue;
            }

            validUsers.push({
                id,
                email: user.email.trim().toLowerCase(),
                name: user.name.trim(),
                ...(typeof user.country === "string"
                    ? { country: user.country }
                    : {}),
            });
        }

        return validUsers;
    } catch (error) {
        console.error(
            "Error fetching users for news email:",
            error
        );

        return [];
    }
};
