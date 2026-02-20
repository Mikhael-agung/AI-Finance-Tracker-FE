'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import GmailConnect from '@/components/sync/GmailConnect'
import EmailSyncStatus from '@/components/sync/EmailSyncStatus'
import SyncHistory from '@/components/sync/SyncHistory'
import { Button } from '@/components/ui/button'
import { syncApi } from '@/lib/api/sync'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

export default function SyncSettingsPage() {
  const [isGmailConnected, setIsGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<any>(null)

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const result = await syncApi.getSyncStatus()
      setSyncStatus(result.data)
      
      // Cek apakah Gmail connected
      if (result.data?.gmail) {
        setIsGmailConnected(true)
        setGmailEmail(result.data.gmail.email)
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  const handleManualSync = async () => {
    try {
      setIsSyncing(true)
      const result = await syncApi.triggerSync()
      toast.success(`Sync complete! ${result.data.created} new transactions`)
      fetchSyncStatus()
    } catch (error: any) {
      toast.error(error.message || 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Sync Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Connect your Gmail account to automatically import bank transactions
          </p>
        </div>
        
        {isGmailConnected && (
          <Button 
            onClick={handleManualSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gmail Integration</CardTitle>
          <CardDescription>
            Connect your Gmail account to sync bank emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GmailConnect 
            isConnected={isGmailConnected}
            email={gmailEmail}
            onConnected={fetchSyncStatus}
          />
        </CardContent>
      </Card>

      {isGmailConnected && (
        <>
          <EmailSyncStatus />
          <SyncHistory />
        </>
      )}
    </div>
  )
}