import React, { useState } from 'react';
import { ScrollView, Text, View, Image, SafeAreaView } from 'react-native';
import { Link, router } from 'expo-router';
// import { useNavigation } from '@react-navigation/native';
import { images } from '../../constants';
import FormField from '../components/FormField'
import CustomButton from '../components/CustomButton'


const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const jsonResponse = await response.json();
      if (response.status === 200) {
        console.log('注册成功:', jsonResponse);
        router.push('/sign-in');
      } else {
        console.log('注册失败:', jsonResponse.message);
      }
    } catch (error) {5
      console.error('网络请求错误:', error);
    }
    setIsSubmitting(false);
  };

  const handleChangeText = (field, value) => {
    setForm(currentForm => ({ ...currentForm, [field]: value }));
  };

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
            handleChangeText={(text) => handleChangeText('username', text)}
            otherStyles="mt-7"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(text) => handleChangeText('email', text)}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(text) => handleChangeText('password', text)}
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
  );
};

export default SignUp;
