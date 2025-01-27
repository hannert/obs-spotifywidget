'use client'
 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userDataStore } from "../../store";
export default function Login() {

  const [passwordVis, setPasswordVis] = useState(false)

  const loginAction = userDataStore((state) => state.login)
  const router = useRouter()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsername = async (e: any) => {
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setUsername(newText);
    }
  }
  const handlePassword = (e: any) => {
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setPassword(newText);
    }
  }

  const togglePasswordVis = (e: any) => {
    e.preventDefault();
    setPasswordVis(!passwordVis);
  }


  const submit = async (e: any) => {
    e.preventDefault();
    let resCode: number
    resCode = await loginAction(username as string, password as string);
    if (resCode === 200) {
      console.log("200 from LOGIN -> Redirect to home page")
      try{
        // Set cookie to denote if the user is logged in or not for useEffects in other pages
        // Should contain no sensitive data, only boolean

        localStorage.setItem('IsLoggedIn', 'true');
        router.push('/home');
      } catch (error) {
        console.log(error)
        console.log('Error redirecting to the login page')
      }
      
    }

  }

  return (
    <div className="w-full h-dvh flex items-center justify-center">
    
    <Card className='w-72'>
      <CardHeader>
        <CardTitle>
          Login
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form className='flex'>
          <div className="grid w-full items-center gap-4">
            <Label htmlFor='username'>Username</Label>
            <Input 
              className=""
              id='username' 
              placeholder='username' 
              value={username} 
              onChange={handleUsername} 
            />
            <Label htmlFor='password'>Password</Label>
            <div className="flex w-full items-center space-x-2">
              <Input 
                id='password' 
                placeholder='password' 
                type={passwordVis ? 'text' : 'password'}
                value={password} 
                onChange={handlePassword} 
              />
              <Button onClick={togglePasswordVis}>
                {passwordVis ? 
                  <Eye />
                  :
                  <EyeClosed />
                }
              </Button>
            </div>
            <Button onClick={(submit)}>Submit</Button>
            <Separator orientation="horizontal" className=""/>
            <div className="flex justify-center text-xs uppercase">
              <a href='/register' className="hover:underline">or register here</a>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}
