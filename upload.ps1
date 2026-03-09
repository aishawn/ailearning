# Optional: sync images to public before push (copy runs again on deploy during pnpm build)
# node scripts/copy-images.mjs

python .\scripts\replace_img_uploadr2.py


# Commit to Git (only if there are changes)
git add .
$status = git status --porcelain
if ($status) {
    Write-Host "Changes detected, committing..." -ForegroundColor Green
    git commit -m 'update sitemap and submit to IndexNow'
    git push -u origin main
    Write-Host "Git push completed successfully" -ForegroundColor Green
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}