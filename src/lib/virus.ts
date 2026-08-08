const fetch = globalThis.fetch
import FormData from 'form-data'
import { prisma } from './db'
import { getPresignedDownloadUrl } from './s3'

const VT_API_URL = 'https://www.virustotal.com/api/v3'
const VT_KEY = process.env.VIRUSTOTAL_API_KEY

export async function scanMaterial(materialId: number) {
  const material = await prisma.material.findUnique({ where: { id: materialId } })
  if (!material) throw new Error('Material not found')

  // set status to queued
  await prisma.material.update({ where: { id: materialId }, data: { scanStatus: 'queued' } })

  // if no VirusTotal key provided, simulate scan (mark as clean)
  if (!VT_KEY) {
    await prisma.material.update({ where: { id: materialId }, data: { scanStatus: 'clean', scannedAt: new Date() } })
    return { status: 'clean', simulated: true }
  }

  try {
    // get presigned download url for the material file
    const url = await getPresignedDownloadUrl(material.fileKey, 60 * 60)

    // fetch the file
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()

    // upload file to VirusTotal
    const form = new FormData()
    form.append('file', Buffer.from(buffer), { filename: material.fileKey })

    const uploadRes = await fetch(`${VT_API_URL}/files`, {
      method: 'POST',
      headers: { 'x-apikey': VT_KEY },
      body: form as any
    })

    const uploadJson = await uploadRes.json()
    const analysisId = uploadJson.data?.id
    if (!analysisId) throw new Error('VirusTotal upload failed')

    // poll analysis
    await prisma.material.update({ where: { id: materialId }, data: { scanStatus: 'scanning' } })

    let analysisUrl = `${VT_API_URL}/analyses/${analysisId}`
    let attempts = 0
    while (attempts < 20) {
      const aRes = await fetch(analysisUrl, { headers: { 'x-apikey': VT_KEY } })
      const aJson = await aRes.json()
      const status = aJson.data?.attributes?.status
      if (status === 'completed') {
        const stats = aJson.data?.attributes?.stats || {}
        const malicious = stats.malicious || 0
        const suspicious = stats.suspicious || 0
        const reportUrl = `https://www.virustotal.com/gui/file/${aJson.meta?.file_info?.sha256}/detection`
        const finalStatus = (malicious || suspicious) ? 'infected' : 'clean'
        await prisma.material.update({ where: { id: materialId }, data: { scanStatus: finalStatus, scanReportUrl: reportUrl, scannedAt: new Date() } })
        return { status: finalStatus, reportUrl }
      }
      attempts++
      await new Promise(r => setTimeout(r, 3000))
    }

    // timeout
    await prisma.material.update({ where: { id: materialId }, data: { scanStatus: 'error', scannedAt: new Date() } })
    return { status: 'error', message: 'Timed out' }
  } catch (err) {
    console.error('Scan error', err)
    await prisma.material.update({ where: { id: materialId }, data: { scanStatus: 'error', scannedAt: new Date() } })
    return { status: 'error', message: String(err) }
  }
}
