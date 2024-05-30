import { ScrollView, Text, View, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { images } from '../../constants'
import FormField from '../components/FormField'
import CustomButton from '../components/CustomButton'

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
    <SafeAreaView className="bg-teal-500 h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4">
        <Image source={images.logo}
          resizeMode='contain' className="w-[380px] h-[100px]"
        />

        <Text className="text-2xl text-white mt-5 font-bold">
        Log in
        </Text>

        <FormField
          title="Email"
          value={form.email}
          handleChangeText={ (e) => setForm ({...form, email: e})}
          otherStyles="mt-5"
          keyboardType="email-address"
        />

        <FormField
          title="Password"
          value={form.password}
          handleChangeText={ (e) => setForm ({...form, password: e})}
          otherStyles="mt-5"
        />

        <CustomButton
          title="Sign In"
          handlePress={submit}
          containerStyles={"mt-10 mb-1"}
          isLoading={isSubmitting}
        />

        <View className="justify-center pt-3 flex-row gap-3">
          <Text className="text-lg font-medium text-white">
            Don't have account?
          </Text>
          <Link href="/sign-up" className='text-lg font-extrabold text-orange-200'>
          Sign Up</Link>
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn
