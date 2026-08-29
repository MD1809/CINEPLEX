export interface DashboardMetrics {
  totalRevenue: number;
  ticketRevenue: number;
  snackRevenue: number;
  totalTicketsSold: number;
  totalActiveMovies: number;
  roomOccupancyRate: number;
  totalOrders: number;
  period: string;
}

export interface RevenueChartPoint {
  date: string;
  displayDate: string;
  ticketRevenue: number;
  snackRevenue: number;
  totalRevenue: number;
  ticketsCount: number;
  orderCount: number;
}

export interface TopMovieRevenue {
  movieId: number;
  title: string;
  posterUrl: string;
  durationMinutes: number;
  ageRating: string;
  ticketsSold: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface PaymentStat {
  method: string;
  methodName: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

export interface SoldTicket {
  ticketId: number;
  ticketCode: string;
  bookingCode: string;
  movieTitle: string;
  posterUrl: string;
  screenType: string;
  roomName: string;
  seatCode: string;
  seatType: string;
  price: number;
  showtimeStart: string;
  showtimeEnd: string;
  bookingChannel: string;
  paymentMethod: string;
  customerName: string;
  staffName?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}
