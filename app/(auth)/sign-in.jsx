import { ScrollView, Text, View, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { images } from '../../constants'
import FormField from '../components/FormField'
import CustomButton from '../components/CustomButton'
import Home from '../(tabs)/home'

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  // const submit = () => {}
  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const jsonResponse = await response.json();
        if (response.ok) {
          console.log('登录成功:', jsonResponse);
          router.push('/home');
          // 适当的页面跳转
        } else {
          console.log('登录失败:', jsonResponse.message);
        }
      } else {
        const textResponse = await response.text();
        console.error('服务器响应不是JSON:', textResponse);
      }
    } catch (error) {
      console.error('网络请求错误:', error);
    }
    setIsSubmitting(false);
  };
  
  

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4">
        <Image source={images.logo}
          resizeMode='contain' className="w-[115px] h-[35px]"
        />

        <Text className="text-2xl text-black mt-10 font-bold">
        Log in to App
        </Text>

        <FormField
          title="Email"
          value={form.email}
          handleChangeText={ (e) => setForm ({...form, email: e})}
          otherStyles="mt-7"
          keyboardType="email-address"
        />

        <FormField
          title="Password"
          value={form.password}
          handleChangeText={ (e) => setForm ({...form, password: e})}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Sign In"
          handlePress={submit}
          containerStyles={"mt-7"}
          isLoading={isSubmitting}
        />

        <View className="justify-center pt-3 flex-row gap-2">
          <Text className="text-lg text-gray-700">
            Don't have account?
          </Text>
          <Link href="/sign-up" className='text-lg font-semibold text-orange-500'>
          Sign Up</Link>
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn
