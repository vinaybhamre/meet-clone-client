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
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const LoginForm = () => {
  const setUser = useSessionStore((state) => state.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", values);

      const { user } = response.data;

      console.log("User: ", user);

      // Save token if needed
      // localStorage.setItem("token", token);

      // Store user in global state
      setUser(user);

      // Navigate to landing page
      navigate("/landing");
    } catch (err) {
      let message = "Login failed. Please try again.";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-16"
      >
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
                  placeholder="Enter Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-red-500 text-lg -mt-10">{error}</p>}

        <Button
          type="submit"
          className="md:w-full mt-4 sm:w-60 sm:h-16 sm:text-2xl cursor-pointer"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
