Unpack GTFS files into this folder:
agency.txt
calendar_dates.txt
calendar.txt
routes.txt
shapes.txt
stops.txt
stop_times.txt
transfers.txt
trips.txt

Make g_stop_times.txt:
grep G\\.\\. stop_times.txt > g_stop_times.txt