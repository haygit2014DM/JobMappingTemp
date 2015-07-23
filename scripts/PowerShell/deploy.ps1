<# Instructions to run
	PREREQ: A) Update to PowerShell 4.0 (download Windows Management Framework 4.0) (the folder will still be named v1.0)
					B) In the PowerShell prompt, type this:		set-executionpolicy remotesigned														(and respond with Y when it asks you)
					C) Copy the folder inside this link: https://codeload.github.com/SublimeText/PowerShell/zip/master
						   into C:\Users\Daniel_Marino\AppData\Roaming\Sublime Text 2\Packages															(or wherever it's installed)
	Instructions to Run:
		From the ActivateAdmin folder in the command prompt, simply type your deploy command. Here are some example deploy commands:
		
		deploy Dev-Int angular							<-- This means deploy just the angular (ActivateAdmin) code to Dev
		deploy Prod from-Test backbone			<-- This means deploy everything (not just ActivateAdmin, but hay101a too) to Prod, by copying whatever's on Test
	Notes:
		avoid having any encrypted folders or files in the source or destination directories
#>

$ErrorActionPreference = "Stop"

#
# ===================================================== Utility
#
Function EndFunction(){
	#Read-Host "Press Enter to exit"
	exit
}
Function TryPrint($text, $color){
	if($colors){
		Write-Host $text -foregroundcolor $color
	}
	else{
		Write-Host $text
		EndFunction
	}
}
Function PrintGreen($text){
	TryPrint $text 'green'
}
Function Print($text){
	TryPrint $text 'white'
}
Function PrintGray($text){
	TryPrint $text 'gray'
}
Function PrintYellow($text){
	TryPrint $text 'yellow'
}
#most of the reddish colors we haven't found a way to support yet so currently they're all in red
Function PrintOrange($text){
	TryPrint $text 'red'
}
Function PrintRedOrange($text){
	TryPrint $text 'red'
}
Function PrintRed($text){
	TryPrint $text 'red'
}
Function PrintRedBrown($text){
	TryPrint $text 'red'
}
Function Shorten($str, $len, $dots){
	$str = "" + $str
	if($str.length -gt $len){
		$shortened = $str.Substring(0, $len)
		if($dots){
			$shortened += '...'
		}
		return $shortened
	}
	return $str
}
Function ShowError(){
	$text = $error[0].ToString()
	$text = Shorten $text 76 $TRUE
	PrintGray $text
}
Try{
	$strComputer = "."
	$colItems = get-wmiobject -class "Win32_Process" -namespace "root\CIMV2" -computername $strComputer | write-output
	$colors = $TRUE
}
Catch{
	ShowError
	$colors = $FALSE
}
Function Rand(){
	$ret = Get-Random -Minimum 0 -Maximum 9999
	return $ret
}
Function Toward($a, $b, $amount){
	$ret = ($a * (1 - $amount)) + ($b * $amount);
	return $ret
}
Function GetSize($path){
	Try{
		#Write-Host ("{0:n2}" -f ((gci -path $pth -recurse | measure-object -property length -sum).sum /1mb))
		
		#$s = cmd /c dir $path /s /-c
		#$s[-2] -match "^\s+\d+\sFile\(s\)\s+([0-9,]+)\sbytes"
		#$size = "{0:N2}" -f ($matches[1]/1mb)
		#return $size
		return 0
	}
	Catch{
		return 0
	}
}
Function CopyFolder($source, $dest){
	$thread = {
		param ([string]$paths)
		#$a = 1 / 0
		#try{
			$ind = $paths.IndexOf('___')
			$source = $paths.Substring(0, $ind);
			$ind += 3
			$dest = $paths.Substring($ind, ($paths.length - $ind))
			Copy-Item $source -Destination $dest -Recurse
			#robocopy $source $dest /COPYALL /B /SEC /MIR /R:0 /W:0 /NFL /NDL
			#Write-Host "success"
		#}
		#catch{
			#Write-Host $error
		#}
	}
	$combined = ($source + '___' + $dest)
	ShowProgress ((Start-Job -ScriptBlock $thread -Arg $combined).name) (GetSize $source) $dest 'Copy'
}
Function CopyFolderNonexistingItems($source, $dest){
	$thread = {
		param ([string]$paths)
		#$a = 1 / 0
		#try{
			$ind = $paths.IndexOf('___')
			$source = $paths.Substring(0, $ind);
			$ind += 3
			$dest = $paths.Substring($ind, ($paths.length - $ind))
			robocopy /xc /xn /xo /e $source $dest
			#robocopy $source $dest /COPYALL /B /SEC /MIR /R:0 /W:0 /NFL /NDL
			#Write-Host "success"
		#}
		#catch{
			#Write-Host $error
		#}
	}
	$combined = ($source + '___' + $dest)
	ShowProgress ((Start-Job -ScriptBlock $thread -Arg $combined).name) (GetSize $source) $dest 'Copy'
}
$ignoreFolder = ''
#removes everything in a folder except for the locales and languages subfolders. Untested
Function EmptyFolder($path){
	$thread = {
		param ([string]$path)
		
		#Remove-Item -path $path -Force -Recurse -ErrorAction SilentlyContinue
		
		$ignoreExpression = $path + '\' + $ignoreFolder + '*';
		Get-ChildItem -Path $path -Recurse #-exclude somefile.txt |
		Select -ExpandProperty FullName |
		Where {$_ -notlike $ignoreExpression} |
		sort length -Descending |
		Remove-Item -force -ErrorAction SilentlyContinue
		
		Write-Host "success"
	}
	ShowProgress ((Start-Job -ScriptBlock $thread -Arg $path).name) (GetSize $dest) $dest 'Delete'
}
Function DeleteFolder($path){
	$thread = {
		param ([string]$path)
		#$a = 1 / 0
		#try{
			Remove-Item -path $path -Force -Recurse -ErrorAction SilentlyContinue
			
			Write-Host "success"
		#}
		#catch{
			#Write-Host $error
		#}
	}
	ShowProgress ((Start-Job -ScriptBlock $thread -Arg $path).name) (GetSize $dest) $dest 'Delete'
}
#Note: progress shown is not actual percent done
Function UpdateProgress($percent){
	Write-Progress -Activity "Working..." -PercentComplete $percent -CurrentOperation ((Shorten ("" + $percent) 5 $FALSE) + "% complete") -Status "Please wait."
}
$waiting = $FALSE
$percent = 0
Function ShowProgress($jobName, $maxSize, $dest, $action){
	$waiting = $TRUE
	$percent = 0
	UpdateProgress $percent
	$job = Get-Job -Name $jobName
	$tally = 0
	while($waiting){
		if($job.State -ne 'Running'){
			#Write-Host ($job | Format-List | Out-String)
			#Print 'Done'
			#$result = Receive-Job -Job $job -Keep
			Write-Progress -Activity "Working..." -Completed -Status "Finished."
			#Write-Host (':' + $result + ':')
			#if($result -ne 'success'){
				#Print 'bad'
				#throw [System.Exception] $result
			#}
			break
		}
		
		if($maxSize -eq 0){
			$amount = ((Rand) / 200000000)
			$percent = Toward $percent 100 $amount
		}
		elseif($tally % 1000 -eq 0){
			$size = GetSize $dest
			if($size -eq 0){
				$maxSize = 0
			}
			else{
				$percent = ($size / $maxSize) * 100
				if($action -eq 'Delete'){
					$percent = 100 - $thisPercent
				}
			}
		}
		UpdateProgress $percent
		$tally++
		#Start-Sleep ((Rand) / 10000)
	}
}

#
# ===================================================== Variable setup
#
$targetEnv = ''
$targetPortion = ''
$source = ''
$targetTextPath = "targets.txt"
$localTextPath = "localPaths.txt"
if(!(Test-Path $targetTextPath)){
	$targetTextPath = "scripts/PowerShell/targets.txt"
	$localTextPath = "scripts/PowerShell/localPaths.txt"
}
$computerHost = ''
$computerPath = ''

#
# ===================================================== Parse arguments
#
try{
	$targetsSrc = gc $targetTextPath
	$targets = @()
	foreach($orig in $targetsSrc){
		$targets += $orig -replace '\s\s+', "`t"
	}
	$lowEnvironment = $FALSE
	foreach($arg in $args){
		foreach($target in $targets){
			$split = $target.Split("`t")
			if($split[0] -eq $arg){
				if($arg -eq 'Dev' -or $arg -eq 'Dev-Int'){ $lowEnvironment = $TRUE }
				$targetEnv = $arg
			}
			if('from-' + $split[0] -eq $arg){
				$source = '\\' + $split[1] + '\' + $split[$split.Length - 1]
			}
		}
		$lower = $arg.toLower()
		if($lower -eq 'angular'){
			$targetPortion = 'angular'
			$ignoreFolder = 'languages'
		}
		elseif($lower -eq 'hay101a' -or $lower -eq 'backbone'){
			$targetPortion = 'backbone'
			$ignoreFolder = 'locales'
		}
	}
	$localPathsSrc = gc $localTextPath
	$localPaths = @()
	foreach($orig in $localPathsSrc){
		$localPaths += ($orig -replace '\s\s+', "`t").Split("`t")[1]
	}
	if($source -eq ''){
		if($targetPortion -eq 'angular'){ $source = $localPaths[2] }
		elseif($lowEnvironment){ $source = $localPaths[0] }
		else{ $source = $localPaths[1] }
		if(!(Test-Path($source))){
			PrintRed ('No such source directory ' + $source + ' exists, please recheck localPaths.txt')
			EndFunction
		}
	}
	else{
		if($targetPortion -eq 'angular'){ $source = $source + '\hgApps' }
	}

	if($targetPortion -ne 'backbone' -and $targetPortion -ne 'angular'){
		PrintRed 'Please specify either "angular" or "backbone" (meaning all components).'
		EndFunction
	}
}
Catch{
	ShowError
	PrintRedBrown 'A critical initialization error has occurred. Please recheck your arguments'
	EndFunction
}

#
# ===================================================== The main deploy function
#
Function DeployWithBackup(){
	#Step 1: Delete old junk data
	$backupSuffix = Rand
	Try{
		$step = 1
		if(Test-Path("\\$computerHost\$computerPath" + "_Backup")){
			Print ('Deleting junk files from ' + $computerHost)
			DeleteFolder ("\\$computerHost\$computerPath" + "_Backup")
		}
		$backupSuffix = ''
	}
	Catch{
		ShowError
		PrintYellow 'Was unable to delete old backup data from $computerHost'
	}
	
	#Step 2: Take a new backup of the current folder
	$backupPath = "\\$computerHost\$computerPath" + '_Backup' + $backupSuffix
	Try{
		$step = 2
		Print ("Backing up existing files on " + $computerHost)
		Rename-Item -path "\\$computerHost\$computerPath" $backupPath
	}
	Catch{
		ShowError
		PrintRedOrange ('Unable to backup up existing data from ' + $computerHost + '. Deployment to this server has been cancelled.')
		return $FALSE
	}
	
	#Step 3: Deploy
	Try{
		$step = 3
		Print ('Deploying to ' + $computerHost)
		CopyFolder $source "\\$computerHost\$computerPath"
		
		Print ('Ensuring translation integrity (part 1)')
		$languageSubfolder = "\\$computerHost\$computerPath\" + $ignoreFolder
		if(Test-Path $languageSubfolder){ DeleteFolder $languageSubfolder }
		Print ('Ensuring translation integrity (part 2)')
		CopyFolder ($backupPath + '\' + $ignoreFolder) $languageSubfolder
		
		if($targetPortion -eq 'backbone'){
			Print ('Ensuring hgApps integrity (part 1)')
			$hgApps = "\\$computerHost\$computerPath\hgApps"
			if(Test-Path $hgApps){ DeleteFolder $hgApps }
			Print ('Ensuring hgApps integrity (part 2)')
			CopyFolder ($backupPath + '\hgApps') $hgApps
			
			Print ('Ensuring integrity of preexisting root')
			CopyFolderNonexistingItems $backupPath "\\$computerHost\$computerPath\"
		}
		
		Print ('Finished copying files to ' + $computerHost)
	}
	Catch{
		ShowError
		PrintRedOrange ('Error, rolling back ' + $computerHost)
		if(Test-Path "\\$computerHost\$computerPath"){
			Try{
				DeleteFolder ("\\$computerHost\$computerPath")
			}
			Catch{
				ShowError
				PrintRedOrange ('Unable to delete the faulty "\\' + $computerHost + '\' + $computerPath + ' folder. Please delete it by hand and restore from ' + $backupPath + '. Deployment to this server has been cancelled')
			}
		}
		Rename-Item -path $backupPath "\\$computerHost\$computerPath"
		Print ($computerHost + ' has been rolled back.')
		return $FALSE
	}
	
	#Step 4: Cleanup
	$step = 4
	Print ('Performing cleanup on ' + $computerHost)
	$safeVersion = "\\$computerHost\$computerPath" + '_SafeVersion'
	if(!(Test-Path $safeVersion)){
		Rename-Item -path $backupPath $safeVersion
	}
	else{
		PrintYellow ("A permanent backup, \\" + $computerHost + '\' + $computerPath + "_SafeVersion, already exists, so not creating one")
		Try{
			DeleteFolder $backupPath
		}
		Catch{
			ShowError
			PrintYellow ('Please remove the unnecessary backup directory \\' + $computerHost + '\' + $computerPath + '_Backup' + $backupSuffix)
		}
	}
	return $TRUE
}

#
# ===================================================== Much simpler version, if no current data exists on the server that needs backing up
#
Function DeployWithoutBackup(){
	PrintYellow ('The directory \\' + $computerHost + '\' + $computerPath + ' does not currently exist')
	Try{
		$step = 3
		Print ('Deploying to ' + $computerHost)
		CopyFolder $source "\\$computerHost\$computerPath"
		Print ('Finished copying files to ' + $computerHost)
		return $TRUE
	}
	Catch{
		ShowError
		PrintRedOrange 'Error, deleting files deployed so far'
		if(Test-Path "\\$computerHost\$computerPath"){
			Try{
				DeleteFolder ("\\$computerHost\$computerPath")
			}
			Catch{
				ShowError
				PrintRedOrange "Unable to delete the files deployed so far... Deployment to this server has been cancelled."
			}
		}
		return $FALSE
	}
}

#
# ===================================================== Main loop: perform the deploy
#
PrintGray 'Loading...'
for($i = 0; $i -lt 5; $i++){
	PrintGray '...'
}
try{
	$foundEnv = $FALSE
	foreach($target in $targets){
		$split = $target.Split("`t")
		$environ = $split[0]
		$computerHost = $split[1]
		$computerPath = $split[$split.Length - 1]
		if($targetPortion -eq 'angular'){ $computerPath = $computerPath + '\hgApps' }
		if($environ -eq $targetEnv){
			$foundEnv = $TRUE
			if(Test-Connection -Computername $computerHost -BufferSize 16 -Count 1 -Quiet){
				if(!(Test-Path "\\$computerHost\$computerPath")){
					$successForThisServer = DeployWithoutBackup
				}
				else{
					$successForThisServer = DeployWithBackup
				}
				if($successForThisServer){
					PrintGreen ('Completed deployment to ' + $computerHost)
				}
			}
			else{
				PrintRedOrange ($computerHost + ' is not online')
			}
		}
	}
	if(!($foundEnv)){
		PrintRed 'No such environment found'
	}
	EndFunction
}
catch{
	ShowError
	PrintRedBrown 'Catastrophic Failure'
	EndFunction
}