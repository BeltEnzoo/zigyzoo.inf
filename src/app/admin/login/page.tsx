import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return <LoginForm initialError={error} />;
}
