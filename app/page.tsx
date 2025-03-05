import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Users, Package, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Smart Inventory System</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Smart Inventory Theft Detection System</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Secure your inventory with our advanced theft detection system. Monitor, track, and protect your assets in
              real-time.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admin">
                <Button size="lg" className="gap-2">
                  Admin Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/employee">
                <Button size="lg" variant="outline" className="gap-2">
                  Employee Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <ShieldAlert className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Theft Detection</CardTitle>
                <CardDescription>
                  Advanced algorithms to detect unusual inventory movements and potential theft
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our system uses AI to analyze patterns and detect anomalies in real-time, alerting you to potential
                  theft before it happens.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/features/theft-detection" className="text-primary hover:underline">
                  Learn more
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Complete inventory tracking and management system</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Track your inventory in real-time, manage stock levels, and get insights into inventory movement and
                  usage patterns.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/features/inventory-management" className="text-primary hover:underline">
                  Learn more
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>Role-based access control for administrators and employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Manage user permissions, track user activity, and ensure only authorized personnel have access to
                  sensitive inventory data.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/features/user-management" className="text-primary hover:underline">
                  Learn more
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground">
            © {new Date().getFullYear()} Smart Inventory Theft Detection System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

