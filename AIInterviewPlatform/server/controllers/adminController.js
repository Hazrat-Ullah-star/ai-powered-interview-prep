const { db } = require('../config/firebase');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const snapshot = await db.collection('users').get();
    let users = snapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(searchLower)) ||
        (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }

    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = users.length;
    const paginatedUsers = users.slice((page - 1) * limit, page * limit);

    res.json({ success: true, users: paginatedUsers, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User not found' });
    
    const currentStatus = userDoc.data().isActive !== false;
    const newStatus = !currentStatus;

    await db.collection('users').doc(req.params.id).update({ isActive: newStatus });
    
    const updatedDoc = await db.collection('users').doc(req.params.id).get();
    const user = { id: updatedDoc.id, _id: updatedDoc.id, ...updatedDoc.data() };

    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide analytics
// @route   GET /api/admin/analytics
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      usersSnapshot,
      interviewsSnapshot,
      challengesSnapshot,
      submissionsSnapshot
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('interviews').where('status', '==', 'completed').get(),
      db.collection('challenges').get(),
      db.collection('submissions').get()
    ]);

    const totalUsers = usersSnapshot.size;
    const totalInterviews = interviewsSnapshot.size;
    const totalChallenges = challengesSnapshot.size;
    const totalSubmissions = submissionsSnapshot.size;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = usersSnapshot.docs.filter(doc => new Date(doc.data().createdAt || 0) >= oneWeekAgo).length;

    const completedInterviews = interviewsSnapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));
    
    const sumScore = completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0);
    const platformAvgScore = totalInterviews ? (sumScore / totalInterviews).toFixed(1) : 0;

    completedInterviews.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
    const recentInterviews = await Promise.all(completedInterviews.slice(0, 10).map(async i => {
      const userDoc = await db.collection('users').doc(i.user).get();
      return {
        ...i,
        user: userDoc.exists ? { id: userDoc.id, _id: userDoc.id, ...userDoc.data() } : null
      };
    }));

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalInterviews,
        totalChallenges,
        totalSubmissions,
        newUsersThisWeek,
        platformAvgScore
      },
      recentInterviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote user to admin
// @route   PUT /api/admin/users/:id/promote
const promoteUser = async (req, res, next) => {
  try {
    await db.collection('users').doc(req.params.id).update({ role: 'admin' });
    const userDoc = await db.collection('users').doc(req.params.id).get();
    res.json({ success: true, user: { id: userDoc.id, _id: userDoc.id, ...userDoc.data() } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, toggleUserStatus, deleteUser, getAdminAnalytics, promoteUser };
