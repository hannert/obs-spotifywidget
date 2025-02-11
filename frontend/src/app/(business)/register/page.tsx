'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";
import { userDataStore, UsernameQuery } from "../../store/store";
export default function Login() {

  const registerAction = userDataStore((state) => state.register);
  const checkUsername = userDataStore((state) => state.checkUsername);
  const router = useRouter();

  const [passwordVis, setPasswordVis] = useState(false);

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameSub, setUsernameSub] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordSub, setPasswordSub] = useState('');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailSub, setEmailSub] = useState('');

  //const [isSubmitValid, setIsSubmitValid] = useState(false);


  const handleUsername = async (e: SyntheticEvent) => {
    const newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setUsernameError(false)
      setUsername(newText);
      // Check if username is taken 
      const result = await checkUsername(newText) as UsernameQuery;
      if (result.isUsernameAvailable === false) {
        setUsernameError(true);
        setUsernameSub('Username is taken!');
      }
    }
  }

  // TODO : Password strength checker
  const handlePassword = (e: SyntheticEvent) => {
    if ((e.target as HTMLInputElement).value !== null){
      setPassword((e.target as HTMLInputElement).value);
    }
  }
  const handleConfirmPassword = (e: SyntheticEvent) => {
    const newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setPasswordError(false);
      setConfirmPassword(newText);
      if (newText !== password) {
        setPasswordError(true);
        setPasswordSub('Passwords need to match!');
      }
    }

  }  
  
  // Props to ui.dev
  function emailIsValid (email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleEmail = (e: SyntheticEvent) => {
    const newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setEmailError(false);
      setEmail(newText);
      if (emailIsValid(newText) === false) {
        setEmailError(true);
        setEmailSub('Email is invalid!');
      }
    }
  }

  const togglePasswordVis = (e: SyntheticEvent) => {
    e.preventDefault();
    setPasswordVis(!passwordVis);
  }


  const handleSubmit = async () => {
    // Check if all fields are valid
    const response = await registerAction(username, password, email)
    if (response !== 200){
      // Not successful
      if (response == 409) {
        console.log('409');
        return
      }

      return
    }
    if (response === 200){
      // Successful registration: Try to log in with that information and push to home
      router.push('/home');      
    }
  }

  return (
    <div className="w-full h-dvh flex items-center justify-center">
      <Card className="w-72">
        <CardHeader>
          <CardTitle>
            Register
          </CardTitle>
        </CardHeader>
      <CardContent>
        <form>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col'>
              <Label>Username</Label>
              <Input name='username' 
              className={ (usernameError ? 'border-6 border-red-500': '')} 
              required value={username} 
              onClick={() => {setUsernameError(false)}}
              onChange={handleUsername} 
              autoComplete="new-password"
              />
              <div>{usernameError && usernameSub}</div>
            </div>

          <div className='flex space-y-2'>
            <div className="flex flex-col  w-full items-center gap-2">
              <div>
                <Label>Password</Label>
                <Input name='password' 
                  className='  '
                  type={passwordVis ? 'text' : 'password'} 
                  required value={password} 
                  onChange={handlePassword} 
                  placeholder="password"
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input name='confirmPassword' 
                  className=' ' 
                  type={passwordVis ? 'text' : 'password'} 
                  required value={confirmPassword} 
                  placeholder="confirm password" 
                  onChange={handleConfirmPassword}
                />
              </div>

            </div>
            <div className="flex items-center m-2">
              <Button onClick={togglePasswordVis}>
              {passwordVis ? 
                <Eye />
                :
                <EyeClosed />
              }
              </Button>            
            </div>
          </div>
          <div>{passwordError && passwordSub}</div>


          <div className='flex flex-col'>
            <Label>Email</Label>
            <Input 
              className='  '
              name='email' 
              autoComplete="new-password" 
              value={email} 
              onChange={handleEmail}
            />
            <div>{emailError && emailSub}</div>
            
          </div>

          
          <Button 
            type="submit" 
            onClick={handleSubmit} 
          >
            Submit
          </Button>
          </div>
        </form>
        <div className="mt-4 flex flex-col gap-y-2">
          <Separator orientation="horizontal" className=""/>
          <div className="flex justify-center text-xs uppercase">
            <a href='/login' className="hover:underline">back to login</a>
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  )
}
