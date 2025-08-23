import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

const UnAuth = () => {
  const pathName = usePathname();
  
  return (
    <div className="flex min-h-[60vh] items-center flex-col justify-center">
      <p className="text-lg">Please log in to view this Page.</p>
      <Button className='mt-5' variant="outline">
        <Link href={`/login?redirect=${pathName}`}>Go to Login</Link>
      </Button>
    </div>
  );
};

export default UnAuth;
