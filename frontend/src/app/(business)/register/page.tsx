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

  const registerAction = userDataStore((state) => state.register);
  const checkUsername = userDataStore((state) => state.checkUsername);
  const loginAction = userDataStore((state) => state.login);
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
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailSub, setEmailSub] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [isSubmitValid, setIsSubmitValid] = useState(false);


  const handleUsername = async (e: any) => {
    console.log(e)
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setUsernameError(false)
      setUsername(newText);
      // Check if username is taken 
      let result = await checkUsername(newText) as any;
      if (result.isUsernameAvailable === false) {
        setUsernameError(true);
        setUsernameSub('Username is taken!');
      }

    }
  }

  // TODO : Password strength checker
  const handlePassword = (e: any) => {
    if ((e.target as HTMLInputElement).value !== null){
      setPassword((e.target as HTMLInputElement).value);
    }
  }
  const handleConfirmPassword = (e: any) => {
    let newText = (e.target as HTMLInputElement).value;
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

  const handleEmail = (e: any) => {
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setEmailError(false);
      setEmail(newText);
      if (emailIsValid(newText) === false) {
        setEmailError(true);
        setEmailSub('Email is invalid!');
      }
    }
  }
  const handleConfirmEmail = (e: any) => {
    if ((e.target as HTMLInputElement).value !== null){
      setConfirmEmail((e.target as HTMLInputElement).value);
    }
  }


  const togglePasswordVis = (e: any) => {
    e.preventDefault();
    setPasswordVis(!passwordVis);
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const { username, password } = Object.fromEntries(formData);
    console.log(username, password)
  }

  const submitNew = async () => {
    // Check if all fields are valid



    let response = await registerAction(username, password, email)
    if (response !== 200){
      // Not successful
      if (response == 409) {
        console.log('409');
        return;
      }

    }

    // Successful registration: Try to log in with that information and push to home
    try {
      let loginResponse = await loginAction(username, password);
      if (loginResponse === 200) { router.push('/home') }
    } catch (error) {
      console.log(error)
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
        <form onSubmit={(e) => submit(e)}>
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
            onClick={submitNew} 
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
