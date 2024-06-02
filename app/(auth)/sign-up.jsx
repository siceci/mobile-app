import React, { useState } from 'react';
import { ScrollView, Text, View, Image, SafeAreaView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { images } from '../../constants';
import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';
import { REACT_APP_API_BASE_URL } from '@env';


const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (form.password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long");
      return false;
    }
    return true;
  }

  const submit = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const jsonResponse = await response.json();
      if (response.status === 200) {
        Alert.alert("Registration Successful", jsonResponse.message);
        router.push('/sign-in');
      } else {
        Alert.alert("Registration Failed", jsonResponse.message);
      }
    } catch (error) {
      Alert.alert("Network Error", 'Network request error: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const handleChangeText = (field, value) => {
    setForm(currentForm => ({ ...currentForm, [field]: value }));
  };

  return (
    <SafeAreaView className="bg-teal-500 h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4">
          <Image source={images.logo}
            resizeMode='contain' className="w-[380px] h-[100px]"
          />

          <Text className="text-2xl text-white mt-10 font-bold">
            Sign Up
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(text) => handleChangeText('username', text)}
            otherStyles="mt-5"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(text) => handleChangeText('email', text)}
            otherStyles="mt-5"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(text) => handleChangeText('password', text)}
            otherStyles="mt-5"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles={"mt-10 mb-1"}
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-3 flex-row gap-3">
            <Text className="text-lg font-medium text-white">
              Already have an account?
            </Text>
            <Link href="/sign-in" className='text-lg font-extrabold text-orange-200'>
            Sign In</Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
