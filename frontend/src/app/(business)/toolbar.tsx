'use client'

import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Github, Home, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import ".././globals.css";
import { userDataStore } from "../store/store";

export default function Toolbar() {


  const router = useRouter()
  const pathname = usePathname();
  const logoutAction = userDataStore((state) => state.logout);


  const handleLogout = async () => {
    try {
      await logoutAction();
      localStorage.removeItem('IsLoggedIn');
      router.push('/');
      return

    } catch (error) {
      console.log(error);
    }

  }


  return (
    <div className="fixed bottom-6 h-10 w-svw flex flex-row justify-center space-x-4">
      <TooltipProvider>
      {
        (pathname === '/home') && (
          <Tooltip>
            <TooltipTrigger className="rounded-md inline-flex items-center justify-center px-4 group hover:bg-accent" onClick={handleLogout}>
              <LogOut className="group-hover:text-accent-foreground" /> 
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>

            <Separator orientation="vertical" />
          </Tooltip>
        )
      }
      {
        (pathname !== '/') && (
          <Tooltip>
            <TooltipTrigger className="rounded-md inline-flex items-center justify-center px-4 group hover:bg-accent" onClick={handleLogout}>
              <Home className="group-hover:text-accent-foreground" /> 
            </TooltipTrigger>
            <TooltipContent>
              <p>Home</p>
            </TooltipContent>

            <Separator orientation="vertical" />
          </Tooltip>
        )
      }

      
      <a className="rounded-md inline-flex items-center justify-center px-4 group hover:bg-accent" href="https://github.com/hannert" target="_blank">
        <Github className="group-hover:text-accent-foreground"/> 
      </a>
      </TooltipProvider>
    </div>
  );
}
