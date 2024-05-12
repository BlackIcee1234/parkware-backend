import firebase_app from "../../config";
import { createUserWithEmailAndPassword, Auth, getAuth, UserCredential } from "firebase/auth";

const auth: Auth = getAuth(firebase_app);

export default async function signUp(email: string, password: string): Promise<{ result: UserCredential | null, error: any }> {
    let result: UserCredential | null = null,
        error: any = null;
    try {
        result = await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
        error = e;
    }

    return { result, error };
}
