import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AmortizationCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(5.27);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [monthlyPayment, setMonthlyPayment] = useState<string>("0");
  const [totalInterestPaid, setTotalInterestPaid] = useState<string>("0");
  const [totalLoanCost, setTotalLoanCost] = useState<string>("0");
  const [payoffDate, setPayoffDate] = useState<string | null>(null);

  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });

  function formatCurrency(amount: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(+amount);
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(navigator.language).format(date);
  };

  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
      const monthlyInterestRate = interestRate / 100 / 12;
      const numberOfPayments = loanTerm * 12;

      const payment =
        (loanAmount *
          (monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
      setMonthlyPayment(payment.toFixed(2));

      const totalInterest = payment * numberOfPayments - loanAmount;
      setTotalInterestPaid(totalInterest.toFixed(2));

      const cost = loanAmount + totalInterest;
      setTotalLoanCost(cost.toFixed(2));

      const start = new Date(startDate);
      start.setMonth(start.getMonth() + numberOfPayments);
      setPayoffDate(start.toISOString().slice(0, 10));
    } else {
      setMonthlyPayment("0");
      setTotalInterestPaid("0");
      setTotalLoanCost("0");
      setPayoffDate(null);
    }
  }, [loanAmount, interestRate, loanTerm, startDate]);

  const isDark = true; // Set this to true for dark mode, or use a custom hook to get the current mode

  const calculateChartData = () => {
    const numPayments = loanTerm * 12;
    const monthlyRate = interestRate / 100 / 12;
    const periods = [];
    let balance = loanAmount;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;

    for (let i = 1; i <= numPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = +monthlyPayment - interestPayment;
      totalPrincipalPaid += principalPayment;
      totalInterestPaid += interestPayment;
      balance -= principalPayment;
      periods.push({
        principalPaid: totalPrincipalPaid,
        interestPaid: totalInterestPaid,
        loanBalance: balance,
      });
    }

    return periods;
  };

  const chartData = calculateChartData();

  const lineChart: any = {
    series: [
      {
        name: "Principal Paid",
        data: chartData.map(period => period.principalPaid),
      },
      {
        name: "Interest Paid",
        data: chartData.map(period => period.interestPaid),
      },
      {
        name: "Loan Balance",
        data: chartData.map(period => period.loanBalance),
      },
    ],
    options: {
      chart: {
        height: 300,
        type: "line",
        toolbar: false,
      },
      colors: ["#4361EE", "#40a9ff", "#f5222d"],
      tooltip: {
        marker: false,
        y: {
          formatter(number: number) {
            return "$" + number.toFixed(2);
          },
        },
      },
      stroke: {
        width: 2,
        curve: "smooth",
      },
      xaxis: {
        categories: Array.from({ length: loanTerm * 12 }, (_, i) => i + 1),
        title: {
          text: "Payment Number",
          style: {
            color: isDark ? "#ffffff" : "#000000",
          },
        },
        axisBorder: {
          color: isDark ? "#191e3a" : "#e0e6ed",
        },
        labels: {
          formatter: (value: number) => {
            const index = value - 1;
            if (loanTerm <= 5) {
              return value;
            } else if (loanTerm <= 15) {
              return index % 12 === 0 ? value : "";
            } else {
              return index % 24 === 0 ? value : "";
            }
          },
        },
      },
      yaxis: {
        opposite: false,
        labels: {
          offsetX: 0,
          formatter: (value: number) => {
            return "$" + value.toFixed(0);
          },
        },
        title: {
          text: "Amount",
          style: {
            color: isDark ? "#ffffff" : "#000000",
          },
        },
        min: 0,
      },
      grid: {
        borderColor: isDark ? "#191e3a" : "#e0e6ed",
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        offsetY: -10,
        labels: {
          colors: isDark ? "#ffffff" : "#000000",
        },
      },
    },
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded bg-gray-800 p-6 shadow-md dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Loan Amount:
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={e => setLoanAmount(parseFloat(e.target.value))}
            className="w-full rounded border-2 border-gray-700 bg-gray-700 p-2 text-white dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Interest Rate (%):
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={e => setInterestRate(parseFloat(e.target.value))}
            className="w-full rounded border-2 border-gray-700 bg-gray-700 p-2 text-white dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Loan Term (years):
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={e => setLoanTerm(parseFloat(e.target.value))}
            className="w-full rounded border-2 border-gray-700 bg-gray-700 p-2 text-white dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full rounded border-2 border-gray-700 bg-gray-700 p-2 text-white dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>
      <hr className="my-4 border-gray-700" />
      <h3 className="mb-4 text-xl font-bold text-white">Results</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-semibold text-gray-300">
            Number of Payments:
          </span>
          <span className="text-white">{loanTerm * 12}</span>
        </div>
        <div>
          <span className="block text-sm font-semibold text-gray-300">
            Monthly Payment:
          </span>
          <span className="text-white">{formatCurrency(monthlyPayment)}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-semibold text-gray-300">
            Total Interest Paid:
          </span>
          <span className="text-white">
            {formatCurrency(totalInterestPaid)}
          </span>
        </div>
        <div>
          <span className="block text-sm font-semibold text-gray-300">
            Total Loan Cost:
          </span>
          <span className="text-white">{formatCurrency(totalLoanCost)}</span>
        </div>
      </div>
      <div className="mt-4">
        <span className="block text-sm font-semibold text-gray-300">
          Payoff Date:
        </span>
        <span className="text-white">
          {payoffDate && formatDate(new Date(payoffDate))}
        </span>
      </div>
      {loanAmount > 0 && interestRate > 0 && loanTerm > 0 && (
        <div className="mt-8">
          <ReactApexChart
            series={lineChart.series}
            options={lineChart.options}
            className="rounded-lg bg-white dark:bg-black"
            type="line"
            height={300}
            width={"100%"}
          />
        </div>
      )}
    </div>
  );
};

export default AmortizationCalculator;
