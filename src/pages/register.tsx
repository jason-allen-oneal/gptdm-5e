import type { NextPage } from "next";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { registerSchema, RegisterInput } from "@/lib/validation/auth";
import Layout from "@/components/Layout";
import RegisterForm from "@/components/user/RegisterForm";
import { useNotification } from "@/lib/contexts/notification";

const Register: NextPage = () => {
  const router = useRouter();
  const { toast } = useNotification();
  
  const { handleSubmit, control, reset, register } = useForm<RegisterInput>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = useCallback(async (data: any) => {
    try {
      const request = await fetch("/api/create/user", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await request.json();

      if (result.status === 201) {
        toast("success", result.message, () => {
          router.push("/user/login/");
        });
      } else {
        toast("error", result.message);
      }
    } catch (err) {
      console.error(err);
      toast("error", JSON.stringify(err));
    }
  }, [router, toast]);

  const data = {
    title: "Register",
    description: "Register an account.",
  };

  return (
    <>
      <Script src="https://www.google.com/recaptcha/api.js" />
      <Layout data={data}>
        <div className="border border-accent p-4">
          <form
            className="flex items-center justify-center w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="card w-96 bg-base-200 border-accent border shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Create an account!</h2>

                <input
                  type="text"
                  placeholder="Type your username..."
                  className="input input-bordered border-accent w-full max-w-xs my-2"
                  {...register('name')}
                />
                
                <input
                  type="email"
                  placeholder="Type your email..."
                  className="input input-bordered border-accent w-full max-w-xs my-2"
                  {...register('email')}
                />
                
                <input
                  type="password"
                  placeholder="Type your password..."
                  className="input input-bordered border-accent w-full max-w-xs my-2"
                  {...register('password')}
                />

                <div className="card-actions items-center justify-between">
                  <p>
                    Already have an account?{" "}
                    <Link href="/login" className="link">
                      Go to login.
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
    </>
  );
};

export default Register;
