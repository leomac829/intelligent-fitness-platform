import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Input, Alert, Select } from 'antd'
import { registerUser, clearError } from '../store/userSlice.ts'
import { Link, useNavigate } from 'react-router-dom'

const { Option } = Select

const Register: React.FC = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [gender, setGender] = useState<string | undefined>(undefined)
  const [age, setAge] = useState<string>("")
  const [fitness_level, setFitnessLevel] = useState<string | undefined>(undefined)
  const [height, setHeight] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: any) => state.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    const result = await dispatch(registerUser({
      username,
      email,
      password,
      name,
      gender,
      age: age ? parseInt(age) : undefined,
      fitness_level,
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined
    }))
    if (registerUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Social login with: ${provider}`)
  }

  return (
    <div className="relative min-h-screen px-6 py-10 flex flex-col justify-center items-center overflow-hidden">
      {/* 基础渐变背景 */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-pink-50 via-white to-pink-50"></div>

      {/* 紫色模糊圆 */}
      <div className="fixed z-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)", filter: "blur(60px)", top: "-10%", left: "-10%", transform: "translateX(51.1684px) translateY(98.8316px) scale(0.90701)" }}></div>

      {/* 粉色模糊圆 */}
      <div className="fixed z-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)", filter: "blur(80px)", top: "30%", right: "-20%", transform: "translateX(-6.84215px) translateY(-6.84215px) scale(1.02566)" }}></div>

      {/* 蓝色模糊圆 */}
      <div className="fixed z-0 w-[450px] h-[450px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)", filter: "blur(70px)", bottom: "-5%", left: "20%", transform: "translateX(23.3049px) translateY(-23.3049px) scale(1.03884)" }}></div>

      {/* 绿色模糊圆 */}
      <div className="fixed z-0 w-[350px] h-[350px] rounded-full" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)", filter: "blur(50px)", top: "60%", left: "-5%", transform: "translateX(42.4495px) translateY(-36.3258px) scale(1.18775)" }}></div>

      {/* 白色高光层 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60" style={{ background: "radial-gradient(80% 60% at 36.1087% 24.6304%, rgba(255, 255, 255, 0.6), transparent 50%), radial-gradient(60% 80% at 53.1521% 75.3696%, rgba(255, 255, 255, 0.4), transparent 50%)" }}></div>

      {/* 斜向光带 */}
      <div className="fixed z-0 pointer-events-none" style={{ width: "200%", height: "100px", background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)", transform: "rotate(-35deg)", top: "20%", left: "100%" }}></div>

      {/* 噪声纹理层 */}
      <div className="pointer-events-none fixed inset-0 z-[1]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E')", opacity: 0.025 }}></div>

      <div className="relative z-10 mx-auto max-w-[400px] w-full">
        <div
          className="hover-lift shadow-2xl opacity-100 border-transparent rounded-lg"
          style={{
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(40px) saturate(250%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0 32px 80px rgba(0, 0, 0, 0.3), 0 16px 64px rgba(255, 255, 255, 0.2), inset 0 3px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.3)",
            padding: "32px",
          }}
        >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold font-sans text-gray-800">创建账号</h2>
          <p className="text-gray-600 font-sans">注册开始您的健身之旅</p>
        </div>

        {error && (
          <Alert
            message="注册失败"
            description={error}
            type="error"
            showIcon
            className="mb-6 rounded-lg"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-800 font-sans block text-left">
              账号
            </label>
            <Input
              id="username"
              placeholder="请输入账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
              style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-800 font-sans block text-left">
              邮箱
            </label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
              style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-800 font-sans block text-left">
              密码
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
                style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-800 font-sans block text-left">
              姓名
            </label>
            <Input
              id="name"
              placeholder="请输入姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
              style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="text-sm font-medium text-gray-800 font-sans block text-left">
              性别
            </label>
            <Select
              id="gender"
              placeholder="请选择性别"
              value={gender}
              onChange={setGender}
              className="w-full bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
              style={{ height: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">其他</Option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium text-gray-800 font-sans block text-left">
                年龄
              </label>
              <Input
                id="age"
                type="number"
                placeholder="请输入年龄"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
                style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fitness_level" className="text-sm font-medium text-gray-800 font-sans block text-left">
                健身水平
              </label>
              <Select
                id="fitness_level"
                placeholder="请选择水平"
                value={fitness_level}
                onChange={setFitnessLevel}
                className="w-full bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
                style={{ height: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <Option value="beginner">初级</Option>
                <Option value="intermediate">中级</Option>
                <Option value="advanced">高级</Option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="height" className="text-sm font-medium text-gray-800 font-sans block text-left">
                身高 (cm)
              </label>
              <Input
                id="height"
                type="number"
                placeholder="请输入身高"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
                style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="weight" className="text-sm font-medium text-gray-800 font-sans block text-left">
                体重 (kg)
              </label>
              <Input
                id="weight"
                type="number"
                placeholder="请输入体重"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-0 bg-white/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200 hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
                style={{ height: '52px', lineHeight: '52px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full ripple-effect hover-lift font-sans font-bold py-5 transition-all duration-300 rounded-lg"
            style={{ backgroundColor: "#0C115B", color: "white" }}
            loading={loading}
          >
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-gray-600 font-sans">或继续使用</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="default"
            onClick={() => handleSocialLogin("Google")}
            className="w-full glass-effect border-gray-200 hover-lift ripple-effect text-gray-800 hover:bg-white/20 font-sans transition-all duration-300 rounded-lg hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
            style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 2.43-4.53 6.16-4.53z"
              />
            </svg>
            使用Google注册
          </Button>

          <Button
            type="default"
            onClick={() => handleSocialLogin("Apple")}
            className="w-full glass-effect border-gray-200 hover-lift ripple-effect text-gray-800 hover:bg-white/20 font-sans transition-all duration-300 rounded-lg hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
            style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 384 512" fill="currentColor">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            使用Apple注册
          </Button>

          <Button
            type="default"
            onClick={() => handleSocialLogin("Meta")}
            className="w-full glass-effect border-gray-200 hover-lift ripple-effect text-gray-800 hover:bg-white/20 font-sans transition-all duration-300 rounded-lg hover:border-gray-300 hover:translate-y-[-2px] hover:shadow-lg"
            style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
            使用Meta注册
          </Button>
        </div>

        <div className="text-center mt-6">
          <span className="text-gray-600 mr-2">已有账号？</span>
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">登录</Link>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Register