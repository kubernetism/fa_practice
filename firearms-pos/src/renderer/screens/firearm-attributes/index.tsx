import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LookupTableEditor } from './lookup-table-editor'

export default function FirearmAttributesScreen() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Firearm Attributes</h1>
      <p className="text-sm text-muted-foreground">
        Manage the dropdown lists used when registering firearm products.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Lookups</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="models">
            <TabsList>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="calibers">Calibers</TabsTrigger>
              <TabsTrigger value="shapes">Shapes</TabsTrigger>
              <TabsTrigger value="designs">Designs</TabsTrigger>
            </TabsList>
            <TabsContent value="models">
              <LookupTableEditor kind="models" />
            </TabsContent>
            <TabsContent value="calibers">
              <LookupTableEditor kind="calibers" />
            </TabsContent>
            <TabsContent value="shapes">
              <LookupTableEditor kind="shapes" />
            </TabsContent>
            <TabsContent value="designs">
              <LookupTableEditor kind="designs" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
