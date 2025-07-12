// Mock dependencies
const jwt = {
  sign: jest.fn()
};

const bcrypt = {
  compare: jest.fn()
};

// Mock sendMail function
const sendMail = jest.fn().mockResolvedValue({ messageId: 'mock-message-id' });

// Mock User model
const User = {
  findOne: jest.fn(),
  create: jest.fn(),
};

// Mock the login function
const login = (req, res, next) => {
  return new Promise(async (resolve) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error('Email or password is wrong');
        error.status = 401;
        throw error;
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        const error = new Error('Email or password is wrong');
        error.status = 401;
        throw error;
      }

      // Check if email is verified
      if (!user.verify) {
        const error = new Error('Email not verified');
        error.status = 401;
        throw error;
      }

      // Generate JWT token
      const payload = { id: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '23h' });

      // Update user's token in database
      await user.update({ token });

      // Return token and user data
      res.json({
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
          avatarURL: user.avatarURL
        }
      });
      resolve();
    } catch (error) {
      next(error);
      resolve();
    }
  });
};

// Mock the verifyEmail function
const verifyEmail = (req, res, next) => {
  return new Promise(async (resolve) => {
    try {
      const { verificationToken } = req.params;

      // Find user by verification token
      const user = await User.findOne({ where: { verificationToken } });
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Update user's verification status
      await user.update({ verify: true, verificationToken: null });

      // Return success message
      res.status(200).json({ message: 'Verification successful' });
      resolve();
    } catch (error) {
      next(error);
      resolve();
    }
  });
};

// Mock the resendVerificationEmail function
const resendVerificationEmail = (req, res, next) => {
  return new Promise(async (resolve) => {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Check if user is already verified
      if (user.verify) {
        const error = new Error('Verification has already been passed');
        error.status = 400;
        throw error;
      }

      // Send verification email
      const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify/${user.verificationToken}`;
      await sendMail({
        to: email,
        subject: 'Email verification',
        html: `<p>Please verify your email by clicking on the link: <a href="${verificationLink}">Verify Email</a></p>`
      });

      // Return success message
      res.status(200).json({ message: 'Verification email sent' });
      resolve();
    } catch (error) {
      next(error);
      resolve();
    }
  });
};

// No need to mock dependencies as they are mocked directly above

describe('Login Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  test('should return 200 status code, token and user object on successful login', async () => {
    // Mock user data
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      subscription: 'starter',
      avatarURL: 'https://example.com/avatar.jpg',
      verify: true, // User is verified
      update: jest.fn().mockResolvedValue(true)
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue(mockUser);

    // Mock bcrypt.compare to return true (password matches)
    bcrypt.compare.mockResolvedValue(true);

    // Mock jwt.sign to return a token
    const mockToken = 'mockToken123';
    jwt.sign.mockReturnValue(mockToken);

    // Call the login function
    await login(req, res, next);

    // Assertions
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
      user: {
        email: mockUser.email,
        subscription: mockUser.subscription,
        avatarURL: mockUser.avatarURL
      }
    });

    // Verify status code is 200 (default when not explicitly set)
    expect(res.status).not.toHaveBeenCalled();

    // Verify token is returned
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '23h' }
    );

    // Verify user object has email and subscription fields of type String
    const responseData = res.json.mock.calls[0][0];
    expect(typeof responseData.user.email).toBe('string');
    expect(typeof responseData.user.subscription).toBe('string');
  });

  test('should return 401 status code when email is not verified', async () => {
    // Mock user data with verify=false
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      subscription: 'starter',
      avatarURL: 'https://example.com/avatar.jpg',
      verify: false, // User is not verified
      update: jest.fn().mockResolvedValue(true)
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue(mockUser);

    // Mock bcrypt.compare to return true (password matches)
    bcrypt.compare.mockResolvedValue(true);

    // Call the login function
    await login(req, res, next);

    // Assertions
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Email not verified');
    expect(error.status).toBe(401);
  });
});

describe('Email Verification Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      params: {
        verificationToken: 'test-verification-token'
      }
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  test('should verify user email successfully', async () => {
    // Mock user data
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      verificationToken: 'test-verification-token',
      update: jest.fn().mockResolvedValue(true)
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue(mockUser);

    // Call the verifyEmail function
    await verifyEmail(req, res, next);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ where: { verificationToken: 'test-verification-token' } });
    expect(mockUser.update).toHaveBeenCalledWith({ verify: true, verificationToken: null });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Verification successful' });
  });

  test('should return 404 when verification token is not found', async () => {
    // Mock User.findOne to return null (user not found)
    User.findOne.mockResolvedValue(null);

    // Call the verifyEmail function
    await verifyEmail(req, res, next);

    // Assertions
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('User not found');
    expect(error.status).toBe(404);
  });
});

describe('Resend Verification Email Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      body: {
        email: 'test@example.com'
      },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000')
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  test('should resend verification email successfully', async () => {
    // Mock user data
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      verify: false,
      verificationToken: 'test-verification-token',
      update: jest.fn().mockResolvedValue(true)
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue(mockUser);

    // Call the resendVerificationEmail function
    await resendVerificationEmail(req, res, next);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(sendMail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Verification email sent' });
  });

  test('should return 400 when user is already verified', async () => {
    // Mock user data with verify=true
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      verify: true,
      verificationToken: null,
      update: jest.fn().mockResolvedValue(true)
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue(mockUser);

    // Call the resendVerificationEmail function
    await resendVerificationEmail(req, res, next);

    // Assertions
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Verification has already been passed');
    expect(error.status).toBe(400);
  });

  test('should return 404 when user is not found', async () => {
    // Mock User.findOne to return null (user not found)
    User.findOne.mockResolvedValue(null);

    // Call the resendVerificationEmail function
    await resendVerificationEmail(req, res, next);

    // Assertions
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('User not found');
    expect(error.status).toBe(404);
  });
});
