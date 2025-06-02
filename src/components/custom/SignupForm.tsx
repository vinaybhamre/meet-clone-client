import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { useSessionStore } from "@/store/sessionStore";

const formSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" }),
});

const SignupForm = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useSessionStore((state) => state.setUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await api.post("/auth/signup", values);

      const user = res.data.user;
      setUser(user);
      navigate("/"); // go to landing page
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Signup failed.";
        setError(message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" w-full space-y-16"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl">Name</FormLabel>
              <FormControl>
                <Input
                  className="h-14 md:text-2xl"
                  placeholder="Enter Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl">Email</FormLabel>
              <FormControl>
                <Input
                  className="h-14 md:text-2xl"
                  type="email"
                  placeholder="Enter Email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl">Password</FormLabel>
              <FormControl>
                <Input
                  className="h-14 md:text-2xl"
                  type="password"
                  placeholder="Enter Password (6+ characters)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-red-600 text-lg font-medium -mt-6">{error}</p>
        )}

        <Button
          type="submit"
          className=" md:w-full mt-4 sm:w-60 sm:h-16 sm:text-2xl cursor-pointer"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
