"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TelecallClient({ id }: { id: string }) {
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get("role") || "Patient";
    const key = role === "Doctor" ? "doctorUser" : "patientUser";
    const storedUser = localStorage.getItem(key);

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({ ...parsed, role });
    } else {
      const fallback = {
        _id: `${role.toLowerCase()}_temp_${Date.now()}`,
        firstName: role === "Doctor" ? "Doctor" : "Patient",
        lastName: "Guest",
        role,
      };
      localStorage.setItem(key, JSON.stringify(fallback));
      setUser(fallback);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user || !id) return;

    import("@zegocloud/zego-uikit-prebuilt").then((mod) => {
      const { ZegoUIKitPrebuilt } = mod;

      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        id,
        user._id,
        `${user.firstName} ${user.lastName}`
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      const room = zp.joinRoom({
        container: document.getElementById("zego-container")!,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showScreenSharingButton: user.role === "Doctor",
        sharedLinks: [
          {
            name: "Patient Join Link",
            url: `${window.location.origin}/telecall/${id}?role=Patient`,
          },
          {
            name: "Doctor Join Link",
            url: `${window.location.origin}/telecall/${id}?role=Doctor`,
          },
        ],
      });

      // 🧩 When Doctor leaves call, mark consultation completed
      window.addEventListener("beforeunload", () => {
        if (user.role === "Doctor") {
          fetch(`/api/teleconsultation/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Completed" }),
          }).catch((err) => console.error("Error marking completed:", err));
        }
      });
    });
  }, [user, id]);

  return (
    <div className="h-screen w-full">
      <div id="zego-container" className="w-full h-full" />
    </div>
  );
}
