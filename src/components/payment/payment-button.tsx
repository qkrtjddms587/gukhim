"use client";

import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface PaymentButtonProps {
  memberName: string;
  amount: number;
  orderName: string;
}

export function PaymentButton({
  memberName,
  amount,
  orderName,
}: PaymentButtonProps) {
  const handlePayment = () => {
    // TODO: 여기에 실제 PG사 연동 코드가 들어갑니다. (다음 단계)
    if (
      confirm(
        `${orderName}\n\n결제 금액: ${amount.toLocaleString()}원\n\n결제를 진행하시겠습니까?`
      )
    ) {
      alert("지금은 테스트 모드입니다. 결제 연동 준비 완료!");
      // 나중에 결제 성공 시 DB 업데이트 API 호출
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-md transition-all active:scale-95"
    >
      <CreditCard className="mr-2 h-5 w-5" />
      {amount.toLocaleString()}원 결제하기
    </Button>
  );
}
