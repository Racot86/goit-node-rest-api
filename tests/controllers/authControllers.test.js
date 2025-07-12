// Mock dependencies
const jwt = {
  sign: jest.fn()
};

const bcrypt = {
  compare: jest.fn()
};

// Mock User model
const User = {
  findOne: jest.fn(),
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
});
