import UserProgress from "../db/models/UserProgress";
import User from "../db/models/User";


export async function getUserProgressById(userId: string, assignmentId: string) {
  const progress = await UserProgress.findOne({ 
    userId, 
    assignmentId 
  }).lean();

  return progress;
}

export async function findByUsername(username: string){
  const user = await User.findOne({ username });
  return user;
}

export async function createUser(username: string, password: string){
  const user = await User.create({ username, passwordHash: password });
  return user;
}