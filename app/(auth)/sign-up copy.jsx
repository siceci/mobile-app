import { ScrollView, Text, View, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { images } from '../../constants'
// import FormField from '../components/FormField'
// import CustomButton from '../components/CustomButton'

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [isSubmitting, setIsSubmittinng] = useState(false)
  // const submit = () => {}

  const submit = async () => {
    setIsSubmittinng(true); // 开始提交，显示加载状态
    try {
      const response = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const jsonResponse = await response.json();
      if (response.status === 200) {
        console.log('注册成功:', jsonResponse);
        // 可以在这里处理注册后的逻辑，如页面跳转等
      } else {
        console.log('注册失败:', jsonResponse.message);
        // 可以显示错误消息
      }
    } catch (error) {
      console.error('网络请求错误:', error);
    }
    setIsSubmittinng(false); // 结束提交，隐藏加载状态
  }
  

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4">
        <Image source={images.logo}
          resizeMode='contain' className="w-[115px] h-[35px]"
        />

        <Text className="text-2xl text-black mt-10 font-bold">
        Sign up to App
        </Text>

        <FormField
          title="UserName"
          value={form.username}
          handleChangeText={ (e) => setForm ({...form, username: e})}
          otherStyles="mt-7"
        />

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
          title="Sign Up"
          handlePress={submit}
          containerStyles={"mt-7"}
          isLoading={isSubmitting}
        />

        <View className="justify-center pt-3 flex-row gap-2">
          <Text className="text-lg text-gray-700">
            Have an account already?
          </Text>
          <Link href="/sign-in" className='text-lg font-semibold text-orange-500'>
          Sign In</Link>
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp
