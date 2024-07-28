import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "@/components/Layout";
import { loginSchema, LoginInput } from "@/lib/validation/auth";
import { useNotification } from "@/lib/contexts/notification";

const Login: NextPage = () => {
  const router = useRouter();
  const { toast } = useNotification();

  const { handleSubmit, control, reset, register } = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
      callbackUrl: "/chat",
    },
  });

  const onSubmit = useCallback(async (data: any) => {
    try {
      await signIn("credentials", { ...data });
      reset();
    } catch (err) {
      console.log("Login error:", err);
      toast("error", JSON.stringify(err));
    }
  }, [reset, toast]);

  const data = {
    title: "Login",
    description: "Login to your account.",
  };

  return (
    <Layout data={data}>
      <div className="border border-accent p-4">
        <form
          className="flex items-center justify-center w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card w-96 border-accent border shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Sign In</h2>
              
              <input
                className="input input-bordered border-accent w-full max-w-xs my-2"
                type="email"
                placeholder="email"
                {...register('email')}
              />
              
              <input
                className="input input-bordered border-accent w-full max-w-xs my-2"
                type="password"
                placeholder="**********"
                {...register('password')}
              />
              
              <div className="card-actions items-center justify-between">
                <p>
                  Don't have an account yet?{" "}
                  <Link href="/register" className="link">
                    Register now!
                  </Link>
                </p>
                <button
                  className={`btn btn-primary`}
                  type="submit"
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};


export default Login;
