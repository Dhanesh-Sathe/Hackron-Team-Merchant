import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight, Package, ShoppingCart, Users, DollarSign, AlertTriangle } from "lucide-react"
import { InventoryChart } from "@/components/inventory-chart"
import { RecentActivities } from "@/components/recent-activities"
import { TheftAlerts } from "@/components/theft-alerts"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory and monitor for theft</p>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">5 items need immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">3 new users this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$123,456</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Alert variant="destructive" className="border-destructive/50 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Theft Alert</AlertTitle>
          <AlertDescription>
            Unusual activity detected in Warehouse B. 5 items missing from Electronics section.
          </AlertDescription>
          <div className="mt-2">
            <Button variant="outline" size="sm" className="text-destructive border-destructive">
              View Details
            </Button>
          </div>
        </Alert>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              <Badge variant="destructive" className="ml-2">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Inventory Overview</CardTitle>
                  <CardDescription>Inventory levels across all categories</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <InventoryChart />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest inventory movements and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivities />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Theft Detection Alerts</CardTitle>
                <CardDescription>Recent suspicious activities that may indicate theft</CardDescription>
              </CardHeader>
              <CardContent>
                <TheftAlerts />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>All Alerts</CardTitle>
                <CardDescription>Manage and respond to system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start p-4 border rounded-lg">
                      <div className="mr-4">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Potential Theft Detected</h3>
                          <Badge variant="outline">High Priority</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Unusual activity detected in Warehouse {String.fromCharCode(64 + i)}. Items missing from
                          inventory.
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                          </span>
                          <Button size="sm" variant="outline" className="gap-1">
                            Investigate <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>View and manage your inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Inventory management content will go here</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>User management content will go here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

