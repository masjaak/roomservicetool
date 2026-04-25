import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeOrderForAdmin, AdminOrderViewModel } from '../utils/adminMappers';
import { createGuestQrToken, revokeGuestSessionAsAdmin } from '../lib/adminAccess';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, UtensilsCrossed, AlertTriangle, MessageSquare, CheckCircle2, Clock, QrCode, Copy, ShieldBan } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';

const STATUS_OPTIONS = [
  'incoming',
  'confirmed',
  'kitchen',
  'preparing',
  'quality_check',
  'delivery',
  'on_the_way',
  'delivered',
  'completed',
  'cancelled'
];

const STATUS_COLORS: Record<string, string> = {
  incoming: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  kitchen: 'bg-orange-100 text-orange-800',
  preparing: 'bg-orange-100 text-orange-800',
  quality_check: 'bg-purple-100 text-purple-800',
  delivery: 'bg-yellow-100 text-yellow-800',
  on_the_way: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderViewModel[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'needs_review'>('active');
  const [hotelId, setHotelId] = useState('atelier-meridian-demo');
  const [stayId, setStayId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState('720');
  const [tokenResult, setTokenResult] = useState<{ qrUrl: string; rawToken: string; expiresAt: string } | null>(null);
  const [tokenStatus, setTokenStatus] = useState<string>('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const parsed = snap.docs.map(normalizeOrderForAdmin);
      setOrders(parsed);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      if (newStatus === 'completed') {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus, isRead: true });
      } else {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const markAsRead = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { isRead: true });
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleGenerateQr = async () => {
    if (!hotelId.trim() || !stayId.trim() || !roomNumber.trim()) {
      setTokenStatus('Hotel ID, stay ID, and room number are required.');
      return;
    }

    setIsGeneratingToken(true);
    setTokenStatus('');

    try {
      const result = await createGuestQrToken({
        hotelId: hotelId.trim(),
        stayId: stayId.trim(),
        roomNumber: roomNumber.trim(),
        baseUrl: window.location.origin,
        expiresInMinutes: Number(expiresInMinutes) || 720,
      });

      setTokenResult(result);
      setTokenStatus('QR token created. Copy the URL into your QR generator or print workflow.');
    } catch (error) {
      console.error('Failed to create guest QR token', error);
      setTokenStatus('Failed to create QR token. Make sure admin auth and Functions deployment are ready.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyTokenUrl = async () => {
    if (!tokenResult?.qrUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(tokenResult.qrUrl);
      setTokenStatus('Guest QR URL copied to clipboard.');
    } catch {
      setTokenStatus('Unable to copy automatically. Copy the URL manually.');
    }
  };

  const handleRevokeGuest = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await revokeGuestSessionAsAdmin(sessionId);
    } catch (error) {
      console.error('Failed to revoke guest session', error);
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Analytics
  const activeOrders = orders.filter(o => !['delivered', 'completed', 'cancelled'].includes(o.status));
  const needsReview = orders.filter(o => o.managerFollowUpRequested || (o.displayRating !== null && o.displayRating <= 3));
  
  const ratingSum = orders.reduce((acc, o) => acc + (o.displayRating || 0), 0);
  const ratedCount = orders.filter(o => o.displayRating !== null).length;
  const avgRating = ratedCount > 0 ? (ratingSum / ratedCount).toFixed(1) : '-';

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return !['delivered', 'completed', 'cancelled'].includes(o.status);
    if (filter === 'completed') return ['delivered', 'completed'].includes(o.status);
    if (filter === 'needs_review') return o.managerFollowUpRequested || (o.displayRating !== null && o.displayRating <= 3);
    return true; // all
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans pb-10">
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-[#2d2d2d]" />
          <h1 className="text-xl font-bold text-[#2d2d2d] tracking-tight">Atelier Meridian | Operations</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => window.location.hash = ''}>Exit to Guest App</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <Card className="mb-8 border-[#d8c8ab]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#2d2d2d]">
              <QrCode className="w-5 h-5" />
              Guest QR Access
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hotel ID</label>
                <input value={hotelId} onChange={(e) => setHotelId(e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#2d2d2d]" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stay ID</label>
                <input value={stayId} onChange={(e) => setStayId(e.target.value)} placeholder="reservation-1204-guest" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#2d2d2d]" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Room Number</label>
                <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="1204" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#2d2d2d]" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expiry (minutes)</label>
                <input value={expiresInMinutes} onChange={(e) => setExpiresInMinutes(e.target.value)} placeholder="720" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#2d2d2d]" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleGenerateQr} disabled={isGeneratingToken}>
                  {isGeneratingToken ? 'Generating…' : 'Generate Guest QR'}
                </Button>
                {tokenResult?.qrUrl && (
                  <Button variant="outline" onClick={copyTokenUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                )}
              </div>
              {tokenStatus && (
                <p className="text-sm text-gray-600">{tokenStatus}</p>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-[#d8c8ab] bg-[#fcfbf8] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Print Pack</p>
              {tokenResult ? (
                <div className="space-y-3 text-sm text-[#2d2d2d]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Guest URL</p>
                    <p className="mt-1 break-all rounded-md bg-white p-3 text-xs leading-relaxed">{tokenResult.qrUrl}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Raw Token</p>
                    <p className="mt-1 rounded-md bg-white p-3 text-xs break-all">{tokenResult.rawToken}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expires At</p>
                    <p className="mt-1 rounded-md bg-white p-3 text-xs">{new Date(tokenResult.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-gray-500">
                  Generate a short-lived QR token for a checked-in guest stay. Use the generated URL inside your QR printer workflow or hotel collateral.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2d2d2d]">{activeOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2d2d2d]">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2d2d2d] flex items-center gap-2">
                {avgRating} <span className="text-base text-gray-400 font-normal">/ 5</span>
              </div>
            </CardContent>
          </Card>
          <Card className={needsReview.length > 0 ? "border-red-200 bg-red-50/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${needsReview.length > 0 ? 'text-red-700' : 'text-[#2d2d2d]'}`}>
                {needsReview.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center mb-6 gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>Active Pipeline</Button>
          <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>Completed</Button>
          <Button variant={filter === 'needs_review' ? 'default' : 'outline'} onClick={() => setFilter('needs_review')} className={filter === 'needs_review' ? "bg-red-600 hover:bg-red-700 text-white border-transparent" : "text-red-600 border-red-200 hover:bg-red-50"}>
            <AlertTriangle className="w-4 h-4 mr-2" /> Needs Review
          </Button>
        </div>

        {/* Table Area */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Room</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 mb-2 text-gray-300" />
                      No orders match the current filter.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className={!order.isRead ? "bg-blue-50/30" : ""}>
                    <TableCell className="font-medium text-lg text-[#2d2d2d]">
                      {!order.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-2" />}
                      {order.roomNumber}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {order.createdAt ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(order.createdAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize font-medium border-0 ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-sm">
                        {order.displayRating !== null && (
                          <div className={`text-xs font-bold px-1.5 py-0.5 rounded w-fit ${order.displayRating <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {order.displayRating} ★
                          </div>
                        )}
                        {order.managerFollowUpRequested && (
                          <div className="flex items-center text-xs text-red-600 font-medium">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Follow-up Req
                          </div>
                        )}
                        {order.displayReviewSummary ? (
                          <span className="text-xs text-gray-600 truncate">{order.displayReviewSummary}</span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No feedback provided</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="secondary" size="sm" onClick={() => !order.isRead && markAsRead(order.id)}>
                            Inspect
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md bg-[#faf8f5] overflow-hidden flex flex-col p-0">
                          
                          {/* Drawer Header */}
                          <div className="p-6 pb-4 border-b bg-white">
                            <SheetHeader>
                              <div className="flex items-center justify-between">
                                <SheetTitle className="text-2xl font-serif text-[#2d2d2d]">Room {order.roomNumber}</SheetTitle>
                                <Badge variant="outline" className={`capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {order.createdAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(order.createdAt) : 'Unknown time'}
                              </div>
                            </SheetHeader>
                          </div>

                          <ScrollArea className="flex-1 px-6 py-4">
                            
                            {/* Workflow / Status Update */}
                            <div className="mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
                              <Select value={order.status} onValueChange={(val) => handleUpdateStatus(order.id, val)}>
                                <SelectTrigger className="w-full bg-white">
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status} className="capitalize">
                                      {status.replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Guest Details */}
                            <div className="mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Guest Info</h3>
                              <div className="bg-white rounded-lg border p-3 text-sm">
                                <div className="grid grid-cols-2 gap-y-2">
                                  <span className="text-gray-500">Name</span>
                                  <span className="font-medium text-right text-[#2d2d2d]">{order.lastName || '-'}</span>
                                  <span className="text-gray-500">Phone</span>
                                  <span className="font-medium text-right text-[#2d2d2d]">{order.phoneNumber || '-'}</span>
                                  <span className="text-gray-500">Guest UID</span>
                                  <span className="font-medium text-right text-[#2d2d2d]">{order.guestUid || '-'}</span>
                                  <span className="text-gray-500">Access Token</span>
                                  <span className="font-medium text-right text-[#2d2d2d]">{order.accessTokenId || '-'}</span>
                                </div>
                                {(order.accessTokenId || order.guestUid) && (
                                  <div className="mt-3 pt-3 border-t">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRevokeGuest(order.accessTokenId || order.guestUid!)}
                                      disabled={revokingSessionId === (order.accessTokenId || order.guestUid)}
                                      className="w-full justify-center text-red-700 border-red-200 hover:bg-red-50"
                                    >
                                      <ShieldBan className="w-4 h-4 mr-2" />
                                      {revokingSessionId === (order.accessTokenId || order.guestUid) ? 'Revoking Session…' : 'Revoke Guest Session'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</h3>
                              <div className="bg-white rounded-lg border p-1 border-gray-200">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="p-3 border-b last:border-0">
                                    <div className="flex justify-between font-medium text-[#2d2d2d] mb-1">
                                      <span>{item.qty}x {item.name}</span>
                                      <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                                    </div>
                                    {item.note && (
                                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">
                                        "{item.note}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <div className="p-3 bg-gray-50 rounded-b-lg">
                                  <div className="flex justify-between text-sm mb-1 text-gray-500">
                                    <span>Subtotal</span>
                                    <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-2 text-gray-500">
                                    <span>Tax & Service</span>
                                    <span>Rp {order.tax.toLocaleString('id-ID')}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-[#2d2d2d] border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span>Rp {order.total.toLocaleString('id-ID')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Payment */}
                            <div className="mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</h3>
                              <div className="bg-white rounded-lg border p-3 text-sm flex items-center justify-between">
                                <span className="text-gray-500">Method</span>
                                <Badge variant="outline" className="capitalize text-[#2d2d2d]">
                                  {order.paymentMethod === 'room' ? 'Room Charge' : order.paymentMethod}
                                </Badge>
                              </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="mb-8">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2" /> Guest Feedback
                              </h3>
                              
                              {order.displayRating === null && !order.displayReviewText ? (
                                <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-center text-sm text-gray-500">
                                  No feedback provided yet.
                                </div>
                              ) : (
                                <div className="bg-white rounded-lg border p-4">
                                  {order.managerFollowUpRequested && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-3 py-2 rounded mb-3 flex items-center">
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Guest requested Manager Follow-up
                                    </div>
                                  )}
                                  
                                  {order.displayRating !== null && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-gray-500 text-sm">Overall:</span>
                                      <span className={`px-2 py-1 rounded text-sm font-bold ${order.displayRating <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {order.displayRating} ★
                                      </span>
                                    </div>
                                  )}

                                  {order.displayReviewText && (
                                    <div className="text-sm text-[#2d2d2d] mb-4 bg-gray-50 p-3 rounded">
                                      "{order.displayReviewText}"
                                    </div>
                                  )}

                                  {order.hasStructuredFeedback && order.structuredDetails && (
                                    <>
                                      <Separator className="my-3" />
                                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                                        {order.structuredDetails.foodQuality !== undefined && (
                                           <><span className="text-gray-500">Food Quality</span><span className="text-right font-medium">{order.structuredDetails.foodQuality} ★</span></>
                                        )}
                                        {order.structuredDetails.deliverySpeed !== undefined && (
                                           <><span className="text-gray-500">Delivery Speed</span><span className="text-right font-medium">{order.structuredDetails.deliverySpeed} ★</span></>
                                        )}
                                        {order.structuredDetails.presentation !== undefined && (
                                           <><span className="text-gray-500">Presentation</span><span className="text-right font-medium">{order.structuredDetails.presentation} ★</span></>
                                        )}
                                        {order.issueCategory && (
                                            <><span className="text-gray-500 pt-2 border-t">Issue Flag</span><span className="text-right text-red-600 font-medium pt-2 border-t">{order.issueCategory}</span></>
                                        )}
                                        {order.structuredDetails.wouldOrderAgain !== undefined && (
                                            <><span className="text-gray-500">Would Order Again</span><span className="text-right font-medium">{order.structuredDetails.wouldOrderAgain ? 'Yes' : 'No'}</span></>
                                        )}
                                      </div>
                                    </>
                                  )}

                                  {!order.hasStructuredFeedback && order.displayReviewSummary && !order.displayReviewText && (
                                    <div className="text-sm text-gray-500 italic mt-2">
                                      Legacy Summary: {order.displayReviewSummary}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                          </ScrollArea>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
};
