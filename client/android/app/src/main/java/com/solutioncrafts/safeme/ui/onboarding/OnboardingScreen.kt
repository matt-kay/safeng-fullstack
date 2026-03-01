package com.solutioncrafts.safeme.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

data class OnboardingPage(
    val title: String,
    val description: String
)

val onboardingPages = listOf(
    OnboardingPage(
        title = "Safe",
        description = "Crowdsourced transport safety for your daily commutes."
    ),
    OnboardingPage(
        title = "Alert",
        description = "Real-time warnings about transport-related incidents."
    ),
    OnboardingPage(
        title = "Community-Driven",
        description = "A network of users looking out for each other."
    )
)

@Composable
fun OnboardingScreen(
    onFinish: () -> Unit
) {
    val pagerState = rememberPagerState(pageCount = { onboardingPages.size })
    val coroutineScope = rememberCoroutineScope()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.weight(1f)
        ) { page ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Placeholder for Image/Lottie
                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .background(MaterialTheme.colorScheme.primaryContainer, CircleShape)
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Text(
                    text = onboardingPages[page].title,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = onboardingPages[page].description,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center
                )
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val isLastPage = pagerState.currentPage == onboardingPages.size - 1

            TextButton(
                onClick = { onFinish() }
            ) {
                Text(text = "Skip")
            }

            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.Center
            ) {
                repeat(onboardingPages.size) { iteration ->
                    val color = if (pagerState.currentPage == iteration) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                    Box(
                        modifier = Modifier
                            .padding(2.dp)
                            .clip(CircleShape)
                            .background(color)
                            .size(8.dp)
                    )
                }
            }

            Button(
                onClick = {
                    if (isLastPage) {
                        onFinish()
                    } else {
                        coroutineScope.launch {
                            pagerState.animateScrollToPage(pagerState.currentPage + 1)
                        }
                    }
                }
            ) {
                Text(text = if (isLastPage) "Get Started" else "Next")
            }
        }
    }
}
