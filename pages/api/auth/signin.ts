import firebase_app from "../../config";
import { signInWithEmailAndPassword, Auth, getAuth, UserCredential } from "firebase/auth";

const auth: Auth = getAuth(firebase_app);

export default async function signIn(email: string, password: string): Promise<{ result: UserCredential | null, error: any }> {
    let result: UserCredential | null = null,
        error: any = null;
    try {
        result = await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
        error = e;
    }

    return { result, error };
}
