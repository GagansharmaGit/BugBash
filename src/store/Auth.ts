import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException,ID,Models } from "appwrite";
import { account } from "@/models/client/config";